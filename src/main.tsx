import { StrictMode, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { AppErrorBoundary } from './components/system/AppErrorBoundary';
import { i18nReady, translate } from './i18n';
import { createWebVitalsEmitter, reportWebVitals } from './performance/reportWebVitals';

const AppRoot = lazy(() => import('./AppRoot'));

const rootContainer = document.getElementById('root');
if (!rootContainer) {
  throw new Error('Missing #root container element.');
}

const configuredSampleRate = Number(import.meta.env.VITE_WEB_VITALS_SAMPLE_RATE ?? '1');
const webVitalsSampleRate = Number.isFinite(configuredSampleRate)
  ? configuredSampleRate
  : 1;

const bootstrap = async (): Promise<void> => {
  await i18nReady;

  ReactDOM.createRoot(rootContainer).render(
    <StrictMode>
      <AppErrorBoundary>
        <Suspense fallback={<div aria-busy="true">{translate('app.loading')}</div>}>
          <AppRoot />
        </Suspense>
      </AppErrorBoundary>
    </StrictMode>,
  );

  reportWebVitals({
    onMetric: createWebVitalsEmitter({
      endpoint: '/api/web-vitals',
      release: import.meta.env.VITE_APP_VERSION ?? 'local',
      sampleRate: webVitalsSampleRate,
    }),
  });
};

void bootstrap();
