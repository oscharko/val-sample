# Frontend Performance Budgets

## Targets

- INP p75: <= 200 ms
- LCP p75: <= 2500 ms
- CLS p75: <= 0.10
- Initial JavaScript transfer (gzip): <= 170 KB
- `form-vendor` chunk (gzip): <= 40 KB

## Enforcement

- Runtime metrics are collected in `src/performance/reportWebVitals.ts`.
- Production metrics are posted to `POST /api/web-vitals` with payload:
  `id`, `name`, `value`, `delta`, `rating`, `navigationType`, `url`, `release`, `recordedAt`.
- Runtime configuration:
  `VITE_WEB_VITALS_SAMPLE_RATE` (`0` to `1`) and `VITE_APP_VERSION` (release label).
- Build-time bundle budgets are enforced by `yarn bundle:check`.
- Coverage minimums are enforced by `yarn coverage:check` (called from
  `yarn test:coverage`).
- CI command: `yarn ci:check`.

## Local Validation

1. `yarn build`
2. `yarn bundle:check`
3. `yarn test:coverage`
4. `yarn lint`
