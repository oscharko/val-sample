const DEFAULT_API_BASE_URL = '/api';
const DEFAULT_WEB_VITALS_PATH = '/web-vitals';

const isAbsoluteHttpUrl = (value: string): boolean =>
  /^https?:\/\//i.test(value);

const ensureLeadingSlash = (value: string): string =>
  value.startsWith('/') ? value : `/${value}`;

const trimTrailingSlash = (value: string): string =>
  value.endsWith('/') ? value.slice(0, -1) : value;

/** Normalisiert relative Pfade: führender Slash, kein Trailing-Slash. */
const normalizeRelativePath = (value: string): string =>
  value === '/' ? '/' : trimTrailingSlash(ensureLeadingSlash(value));

const normalizeApiBaseUrl = (value: string | undefined): string => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return DEFAULT_API_BASE_URL;
  }

  if (isAbsoluteHttpUrl(trimmed)) {
    return trimTrailingSlash(trimmed);
  }

  return normalizeRelativePath(trimmed);
};

const normalizeEndpointPath = (value: string): string =>
  ensureLeadingSlash(value.trim());

export const resolveApiEndpoint = (endpointPath: string): string => {
  const normalizedPath = normalizeEndpointPath(endpointPath);
  const apiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

  if (isAbsoluteHttpUrl(apiBaseUrl)) {
    return new URL(normalizedPath.slice(1), `${apiBaseUrl}/`).toString();
  }

  if (apiBaseUrl === '/') {
    return normalizedPath;
  }

  return `${apiBaseUrl}${normalizedPath}`;
};

export const resolveWebVitalsEndpoint = (): string => {
  const configuredEndpoint = import.meta.env.VITE_WEB_VITALS_ENDPOINT?.trim();
  if (!configuredEndpoint) {
    return resolveApiEndpoint(DEFAULT_WEB_VITALS_PATH);
  }

  if (isAbsoluteHttpUrl(configuredEndpoint)) {
    return configuredEndpoint;
  }

  return normalizeEndpointPath(configuredEndpoint);
};
