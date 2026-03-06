# Architecture Notes: State Scope, Submission Concurrency, German-Only UI

## State Model

- `FormStatusProvider` creates an isolated `FormStatus` store per form instance.
- Hooks in `src/hooks/useFormStatus.ts` consume the provider context and subscribe via
  `useSyncExternalStore` selectors.
- Result: multiple form instances can be rendered without cross-talk in submission state,
  validation summary, or dirty flags.

## Submission Concurrency and Abort Safety

- `useInvestmentFinancingSubmission` assigns a monotonic `requestId` per submit call.
- On each new submit:
  1. active request is aborted,
  2. a new `AbortController` is created,
  3. latest `requestId` becomes the only write-eligible request.
- Response handling applies state updates only when:
  - component is still mounted,
  - response `requestId` matches the current active request.
- `CLIENT_ABORTED` is treated as UX-neutral and does not emit error snackbar feedback.

## German-Only Text and Locale Strategy

- The app uses a single German text catalog at
  `src/i18n/locales/de-DE/translation.ts`.
- `src/i18n/index.ts` resolves keys against that catalog and supports token interpolation
  (`{{token}}`) without a runtime i18n framework.
- `getCurrentLocale()` is fixed to `de-DE`.
- Number, currency, percent, and date formatting in `src/i18n/formatters.ts` is fixed to
  German locale conventions.

## Document Metadata and Canonical URL

- `AppLocaleManager` sets static document language and direction:
  - `document.documentElement.lang = de-DE`
  - `document.documentElement.dir = ltr`
  - `document.body.dir = ltr`
- `?lang=` query parameters are removed via `history.replaceState` while preserving other
  query params.
- Canonical URLs are built from `{origin}{pathname}` only.
- Alternate locale links (`hreflang`) and Open Graph locale alternates are removed.

## Runtime API and Telemetry Routing

- Runtime API endpoints are resolved from `VITE_API_BASE_URL` (default `/api`).
- Investment financing submit calls resolve to:
  - default: `/api/investment-financing`
  - override: `${VITE_API_BASE_URL}/investment-financing`
- Web Vitals endpoint resolves to:
  - `VITE_WEB_VITALS_ENDPOINT` when explicitly configured
  - otherwise `${VITE_API_BASE_URL}/web-vitals`
- Vite `server.proxy` is development-only; production relies on reverse proxy/API
  gateway routing plus matching CORS policy when cross-origin is used.
