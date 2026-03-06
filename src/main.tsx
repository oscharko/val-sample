import { StrictMode, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { AppErrorBoundary } from './components/system/AppErrorBoundary';
import { resolveWebVitalsEndpoint } from './config/runtimeEnv';
import { createWebVitalsEmitter, reportWebVitals } from './performance/reportWebVitals';

const AppRoot = lazy(() => import('./AppRoot'));

const rootContainer = document.getElementById('root');
if (!rootContainer) {
  throw new Error('Root-Container #root wurde nicht gefunden.');
}

const configuredSampleRate = Number(import.meta.env.VITE_WEB_VITALS_SAMPLE_RATE ?? '1');
const webVitalsSampleRate = Number.isFinite(configuredSampleRate)
  ? configuredSampleRate
  : 1;

const bootstrap = (): void => {
  ReactDOM.createRoot(rootContainer).render(
    <StrictMode>
      <AppErrorBoundary>
        <Suspense fallback={<div aria-busy="true">Anwendung wird geladen...</div>}>
          <AppRoot />
        </Suspense>
      </AppErrorBoundary>
    </StrictMode>,
  );

  reportWebVitals({
    onMetric: createWebVitalsEmitter({
      endpoint: resolveWebVitalsEndpoint(),
      release: import.meta.env.VITE_APP_VERSION ?? 'local',
      sampleRate: webVitalsSampleRate,
    }),
  });
};

void bootstrap();
