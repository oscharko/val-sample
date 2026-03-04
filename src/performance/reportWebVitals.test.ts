import { beforeEach, describe, expect, it, vi } from 'vitest';
import { onCLS, onINP, onLCP, type Metric } from 'web-vitals';
import {
  createWebVitalsEmitter,
  reportWebVitals,
  type WebVitalsRuntime,
} from './reportWebVitals';

vi.mock('web-vitals', () => ({
  onCLS: vi.fn(),
  onINP: vi.fn(),
  onLCP: vi.fn(),
}));

const createMetric = (overrides: Partial<Metric> = {}): Metric => ({
  id: 'metric-1',
  name: 'LCP',
  value: 1234,
  delta: 1234,
  rating: 'good',
  entries: [],
  navigationType: 'navigate',
  ...overrides,
});

const createRuntime = (overrides: Partial<WebVitalsRuntime> = {}) => {
  const logMetricMock = vi.fn<(metric: Metric) => void>();
  const sendPayloadMock = vi.fn<(endpoint: string, payload: string) => void>();

  const runtime: WebVitalsRuntime = {
    isProd: true,
    random: () => 0,
    logMetric: logMetricMock,
    sendPayload: sendPayloadMock,
    ...overrides,
  };

  return {
    runtime,
    logMetricMock,
    sendPayloadMock,
  };
};

describe('reportWebVitals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/');
  });

  it('registers CLS, INP and LCP callbacks with the provided handler', () => {
    const onMetric = vi.fn<(metric: Metric) => void>();

    reportWebVitals({ onMetric });

    expect(vi.mocked(onCLS)).toHaveBeenCalledWith(onMetric);
    expect(vi.mocked(onINP)).toHaveBeenCalledWith(onMetric);
    expect(vi.mocked(onLCP)).toHaveBeenCalledWith(onMetric);
  });

  it('registers a default callback when no handler is provided', () => {
    reportWebVitals();

    const clsCallback = vi.mocked(onCLS).mock.calls[0]?.[0];
    const inpCallback = vi.mocked(onINP).mock.calls[0]?.[0];
    const lcpCallback = vi.mocked(onLCP).mock.calls[0]?.[0];

    expect(typeof clsCallback).toBe('function');
    expect(typeof inpCallback).toBe('function');
    expect(typeof lcpCallback).toBe('function');
  });
});

describe('createWebVitalsEmitter', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('logs and sends payload in production when sample check passes', () => {
    window.history.replaceState({}, '', '/financing?step=2');

    const { runtime, logMetricMock, sendPayloadMock } = createRuntime({
      random: () => 0.2,
    });

    const emitMetric = createWebVitalsEmitter({
      endpoint: '/custom-vitals',
      release: 'build-42',
      sampleRate: 0.5,
      runtime,
    });

    const metric = createMetric();
    emitMetric(metric);

    expect(logMetricMock).toHaveBeenCalledWith(metric);
    expect(sendPayloadMock).toHaveBeenCalledTimes(1);

    const [endpoint, payload] = sendPayloadMock.mock.calls[0] ?? [];
    expect(endpoint).toBe('/custom-vitals');
    expect(typeof payload).toBe('string');

    const parsedPayload = JSON.parse(payload ?? '{}') as Record<string, unknown>;

    expect(parsedPayload).toMatchObject({
      id: 'metric-1',
      name: 'LCP',
      value: 1234,
      delta: 1234,
      rating: 'good',
      navigationType: 'navigate',
      url: '/financing?step=2',
      release: 'build-42',
    });

    const recordedAt = parsedPayload.recordedAt;
    expect(typeof recordedAt).toBe('string');
    expect(Number.isNaN(Date.parse(String(recordedAt)))).toBe(false);
  });

  it('does not send payload when not in production', () => {
    const { runtime, logMetricMock, sendPayloadMock } = createRuntime({
      isProd: false,
    });

    const emitMetric = createWebVitalsEmitter({ runtime });
    emitMetric(createMetric());

    expect(logMetricMock).toHaveBeenCalledTimes(1);
    expect(sendPayloadMock).not.toHaveBeenCalled();
  });

  it('does not send payload when sampling excludes the metric', () => {
    const { runtime, sendPayloadMock } = createRuntime({
      random: () => 0.95,
    });

    const emitMetric = createWebVitalsEmitter({
      sampleRate: 0.5,
      runtime,
    });

    emitMetric(createMetric());

    expect(sendPayloadMock).not.toHaveBeenCalled();
  });

  it('falls back to full sampling for non-finite sample rates and clamps bounds', () => {
    const metric = createMetric();

    const nonFiniteRuntime = createRuntime({ random: () => 0.99 });
    createWebVitalsEmitter({
      sampleRate: Number.NaN,
      runtime: nonFiniteRuntime.runtime,
    })(metric);
    expect(nonFiniteRuntime.sendPayloadMock).toHaveBeenCalledTimes(1);

    const belowZeroRuntime = createRuntime({ random: () => 0 });
    createWebVitalsEmitter({
      sampleRate: -1,
      runtime: belowZeroRuntime.runtime,
    })(metric);
    expect(belowZeroRuntime.sendPayloadMock).not.toHaveBeenCalled();

    const aboveOneRuntime = createRuntime({ random: () => 0.99 });
    createWebVitalsEmitter({
      sampleRate: 2,
      runtime: aboveOneRuntime.runtime,
    })(metric);
    expect(aboveOneRuntime.sendPayloadMock).toHaveBeenCalledTimes(1);
  });
});
