import { onCLS, onINP, onLCP, type Metric } from 'web-vitals';

export interface ReportWebVitalsOptions {
  onMetric?: (metric: Metric) => void;
}

export interface WebVitalsEmitterOptions {
  endpoint?: string;
  release?: string;
  sampleRate?: number;
  runtime?: Partial<WebVitalsRuntime>;
}

export interface WebVitalsRuntime {
  isProd: boolean;
  random: () => number;
  logMetric: (metric: Metric) => void;
  sendPayload: (endpoint: string, payload: string) => void;
}

const DEFAULT_WEB_VITALS_ENDPOINT = '/api/web-vitals';
const DEFAULT_SAMPLE_RATE = 1;

const logMetric = (metric: Metric): void => {
  if (!import.meta.env.DEV) {
    return;
  }

  console.info(`[web-vitals] ${metric.name}: ${metric.value.toFixed(2)}`, {
    id: metric.id,
    delta: metric.delta,
    rating: metric.rating,
    navigationType: metric.navigationType,
  });
};

const clampSampleRate = (sampleRate: number): number => {
  if (!Number.isFinite(sampleRate)) {
    return DEFAULT_SAMPLE_RATE;
  }

  return Math.min(1, Math.max(0, sampleRate));
};

const shouldEmitMetric = (sampleRate: number, random: () => number): boolean => {
  if (sampleRate >= 1) {
    return true;
  }

  if (sampleRate <= 0) {
    return false;
  }

  return random() < sampleRate;
};

const toWebVitalsPayload = (metric: Metric, release: string) => {
  return JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    rating: metric.rating,
    navigationType: metric.navigationType,
    url: window.location.pathname + window.location.search,
    release,
    recordedAt: new Date().toISOString(),
  });
};

const sendWebVitalsPayload = (endpoint: string, payload: string): void => {
  if (navigator.sendBeacon?.(endpoint, payload)) {
    return;
  }

  void fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // Intentionally swallow telemetry transport failures.
  });
};

export function createWebVitalsEmitter({
  endpoint = DEFAULT_WEB_VITALS_ENDPOINT,
  release = 'unknown',
  sampleRate = DEFAULT_SAMPLE_RATE,
  runtime,
}: WebVitalsEmitterOptions = {}): (metric: Metric) => void {
  const effectiveSampleRate = clampSampleRate(sampleRate);
  const runtimeConfig: WebVitalsRuntime = {
    isProd: import.meta.env.PROD,
    random: Math.random,
    logMetric,
    sendPayload: sendWebVitalsPayload,
    ...runtime,
  };

  return (metric) => {
    runtimeConfig.logMetric(metric);

    if (!runtimeConfig.isProd || !shouldEmitMetric(effectiveSampleRate, runtimeConfig.random)) {
      return;
    }

    runtimeConfig.sendPayload(endpoint, toWebVitalsPayload(metric, release));
  };
}

export function reportWebVitals({ onMetric = logMetric }: ReportWebVitalsOptions = {}): void {
  onCLS(onMetric);
  onINP(onMetric);
  onLCP(onMetric);
}
