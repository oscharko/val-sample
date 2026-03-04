# Architecture Notes: State Scope, Submission Concurrency, i18n

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

## i18n Initialization and Loading

- Initial locale resolution order is deterministic:
  1. `?lang=` query parameter,
  2. `localStorage` key `app.locale`,
  3. `navigator.language`,
  4. fallback `de-DE`.
- Locale resources are loaded lazily via `i18next-resources-to-backend`.
- App bootstrap (`src/main.tsx`) waits for `i18nReady` before mounting React.

## Translation Key Generation Workflow

- Source of truth for translation keys is `src/i18n/locales/en-US/translation.ts`.
- `yarn generate:i18n-keys` parses that source and regenerates
  `src/i18n/translationKeys.ts`.
- `yarn build` runs translation key generation automatically before type-check and
  bundle creation.
- Generated keys are exported as `TRANSLATION_KEYS` and can be used as:
  `t(TRANSLATION_KEYS['form.fields.person'])`.

### Developer Workflow

- Add or rename keys in `src/i18n/locales/en-US/translation.ts`.
- Keep locale parity by updating `src/i18n/locales/de-DE/translation.ts`.
- Run `yarn generate:i18n-keys`.
- Commit translation changes together with `src/i18n/translationKeys.ts`.

## SEO Locale Links

- `AppLocaleManager` now builds canonical URLs from `{origin}{pathname}` only.
- Canonical URLs intentionally exclude query params and hashes.
- Alternate links use only `?lang=<locale>` on the stable path base.

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
