import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveApiEndpoint, resolveWebVitalsEndpoint } from './runtimeEnv';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('runtimeEnv', () => {
  it('uses /api as default base URL when VITE_API_BASE_URL is not configured', () => {
    vi.stubEnv('VITE_API_BASE_URL', '');
    vi.stubEnv('VITE_WEB_VITALS_ENDPOINT', '');

    expect(resolveApiEndpoint('/investment-financing')).toBe('/api/investment-financing');
    expect(resolveWebVitalsEndpoint()).toBe('/api/web-vitals');
  });

  it('supports custom relative base paths', () => {
    vi.stubEnv('VITE_API_BASE_URL', '/backend-api/');
    vi.stubEnv('VITE_WEB_VITALS_ENDPOINT', '');

    expect(resolveApiEndpoint('/investment-financing')).toBe('/backend-api/investment-financing');
    expect(resolveWebVitalsEndpoint()).toBe('/backend-api/web-vitals');
  });

  it('supports absolute API base URLs', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/v1/');
    vi.stubEnv('VITE_WEB_VITALS_ENDPOINT', '');

    expect(resolveApiEndpoint('/investment-financing')).toBe(
      'https://api.example.com/v1/investment-financing',
    );
    expect(resolveWebVitalsEndpoint()).toBe('https://api.example.com/v1/web-vitals');
  });

  it('prefers explicit web-vitals endpoint overrides', () => {
    vi.stubEnv('VITE_API_BASE_URL', '/api');
    vi.stubEnv('VITE_WEB_VITALS_ENDPOINT', 'https://metrics.example.com/web-vitals');
    expect(resolveWebVitalsEndpoint()).toBe('https://metrics.example.com/web-vitals');

    vi.stubEnv('VITE_WEB_VITALS_ENDPOINT', '/telemetry/vitals');
    expect(resolveWebVitalsEndpoint()).toBe('/telemetry/vitals');
  });
});
