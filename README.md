# val-sample

Frontend für einen Investitionsfinanzierungsbedarf, umgesetzt mit React, TypeScript,
Vite, React Hook Form und Zod.

## Voraussetzungen

- Node.js 20+
- Yarn 1.22+

## Schnellstart

```bash
yarn install
cp .env.example .env
yarn dev
```

Lokale App-URL: `http://localhost:3000`

## Qualitäts-Gates

```bash
yarn lint
yarn test
yarn test:coverage
yarn build
yarn bundle:check
yarn ci:check
```

`yarn test:coverage` erzwingt:
- globale Mindest-Coverage-Schwellen
- Schwellen für kritische Dateien:
  - `src/api.ts`
  - `src/hooks/useInvestmentFinancingSubmission.ts`

## Umgebungsvariablen

| Variable | Pflicht | Standard | Zweck |
| --- | --- | --- | --- |
| `VITE_APP_VERSION` | nein | `local` | Release-Bezeichnung im Web-Vitals-Payload |
| `VITE_WEB_VITALS_SAMPLE_RATE` | nein | `1` | Sampling-Rate (`0` bis `1`) für Produktions-Telemetrie |
| `VITE_API_BASE_URL` | nein | `/api` | Basis-URL für Browser-API-Requests; relativ (`/api`) oder absolut (`https://api.example.com/v1`) |
| `VITE_WEB_VITALS_ENDPOINT` | nein | abgeleitet | Optionaler Override für Web-Vitals-Endpoint; sonst `${VITE_API_BASE_URL}/web-vitals` |

## API-Routing und Deployment-Vertrag

- Browser-Requests werden gebaut aus:
  - `VITE_API_BASE_URL` + Endpoint-Pfad (zum Beispiel `/investment-financing`)
  - oder einer absoluten Basis-URL für Cross-Origin-Gateway-Routing
- Vite `server.proxy` gilt nur für Entwicklung und wird in Produktion nicht genutzt.
- Produktion muss eine der folgenden Varianten bereitstellen:
  - Same-Origin-Reverse-Proxy, der `/api/*` auf Backend-Services routet
  - explizite Cross-Origin-`VITE_API_BASE_URL` plus passende Backend-CORS-Policy für den Frontend-Origin

## Weitere Architekturhinweise

- `docs/architecture-state-i18n.md`
- `docs/performance-budgets.md`
