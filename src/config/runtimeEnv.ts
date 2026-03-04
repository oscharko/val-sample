const DEFAULT_API_BASE_URL = '/api';
const DEFAULT_WEB_VITALS_PATH = '/web-vitals';

const isAbsoluteHttpUrl = (value: string): boolean => {
  return /^https?:\/\//i.test(value);
};

const ensureLeadingSlash = (value: string): string => {
  return value.startsWith('/') ? value : `/${value}`;
};

const trimTrailingSlash = (value: string): string => {
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const normalizeRelativePath = (value: string): string => {
  if (value === '/') {
    return '/';
  }

  return trimTrailingSlash(ensureLeadingSlash(value));
};

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

const normalizeEndpointPath = (value: string): string => {
  return ensureLeadingSlash(value.trim());
};

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
