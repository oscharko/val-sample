import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppErrorBoundary } from './components/system/AppErrorBoundary';
import { reportWebVitals } from './performance/reportWebVitals';

const AppRoot = React.lazy(() => import('./AppRoot'));

const rootContainer = document.getElementById('root');
if (!rootContainer) {
  throw new Error('Missing #root container element.');
}

ReactDOM.createRoot(rootContainer).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <React.Suspense fallback={<div aria-busy="true">Loading application...</div>}>
        <AppRoot />
      </React.Suspense>
    </AppErrorBoundary>
  </React.StrictMode>,
);

reportWebVitals();
