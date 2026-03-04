import { onCLS, onINP, onLCP, type Metric } from 'web-vitals';

export interface ReportWebVitalsOptions {
  onMetric?: (metric: Metric) => void;
}

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

export function reportWebVitals({ onMetric = logMetric }: ReportWebVitalsOptions = {}): void {
  onCLS(onMetric);
  onINP(onMetric);
  onLCP(onMetric);
}
