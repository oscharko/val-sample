/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_WEB_VITALS_ENDPOINT?: string;
  readonly VITE_WEB_VITALS_SAMPLE_RATE?: string;
}
