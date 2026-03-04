# val-sample

Investment financing form frontend built with React, TypeScript, Vite, React Hook Form, Zod, and i18next.

## Prerequisites

- Node.js 20+
- Yarn 1.22+

## Quick Start

```bash
yarn install
cp .env.example .env
yarn dev
```

Local app URL: `http://localhost:3000`

## Quality Gates

```bash
yarn lint
yarn test
yarn test:coverage
yarn build
yarn bundle:check
yarn ci:check
```

`yarn test:coverage` now enforces:
- Global minimum coverage thresholds
- Critical-file thresholds for:
  - `src/api.ts`
  - `src/hooks/useInvestmentFinancingSubmission.ts`

## Environment Variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `VITE_APP_VERSION` | no | `local` | Release label included in Web Vitals payload. |
| `VITE_WEB_VITALS_SAMPLE_RATE` | no | `1` | Sampling rate (`0` to `1`) for production telemetry. |
| `VITE_API_BASE_URL` | no | `/api` | API base URL for browser requests. Supports relative (`/api`) or absolute (`https://api.example.com/v1`). |
| `VITE_WEB_VITALS_ENDPOINT` | no | derived | Optional override for Web Vitals endpoint. If unset: `${VITE_API_BASE_URL}/web-vitals`. |

## API Routing and Deployment Contract

- Browser runtime calls are built from:
  - `VITE_API_BASE_URL` + endpoint path (for example `/investment-financing`)
  - or absolute base URL when cross-origin gateway routing is required.
- Vite `server.proxy` is **development-only** and is not used in production builds.
- Production deployment must provide one of:
  - Same-origin reverse proxy that routes `/api/*` to backend services.
  - Explicit cross-origin `VITE_API_BASE_URL` plus backend CORS policy for the frontend origin.

## i18n Translation Key Workflow

```bash
yarn generate:i18n-keys
```

- Source: `src/i18n/locales/en-US/translation.ts`
- Output: `src/i18n/translationKeys.ts`
- `yarn build` runs key generation automatically before type-check and bundling.

## Additional Architecture Notes

- `docs/architecture-state-i18n.md`
- `docs/performance-budgets.md`
