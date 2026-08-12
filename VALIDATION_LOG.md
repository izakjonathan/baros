# Validation Log — v0.19.0-rc.15

Baseline: **v0.19.0-rc.14**

Focus: environment/configuration integrity and removal of stale deployment assumptions.

## Passed

- `npm run test:current`
- `npm run test:rc15`
- `npm run validate:release`
- `npm run audit:artifacts`
- production-shaped `npm run validate:env`
- syntax checks for the configuration-integrity and inherited build-readiness regression scripts

The current suite also exposed two inherited tests that still depended on historical root Markdown artifacts removed by the slim packaging standard. Those tests were corrected to validate the actual package/workflow contracts instead of requiring obsolete documentation. The rc.14 regression was also made forward-compatible with newer RC version numbers.

## Configuration assertions

- no `CONTENT_SOURCE` environment assignment or `process.env.CONTENT_SOURCE` runtime reference;
- `DATABASE_URL` remains required in production;
- `APP_URL` remains required in production;
- `DEV_AUTH_ENABLED=true` remains forbidden in production;
- browser-local operational persistence remains gated to explicit `devMode`;
- GitHub production build now sets `DEV_AUTH_ENABLED=false`.

## Not run locally

- dependency-backed ESLint
- full TypeScript compilation
- Next.js production build

The extracted release does not contain installed dependencies. GitHub/Vercel remains the dependency-backed production gate.

Database migration: **none**.
