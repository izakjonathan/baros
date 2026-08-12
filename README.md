# Bar Ops v0.19.0-rc.15 — Environment & Configuration Integrity

Current release: **v0.19.0-rc.15**

This release audits and tightens the current runtime/deployment configuration without changing product behavior.

## Runtime data source

Production Bar Ops is PostgreSQL-backed through `DATABASE_URL`. There is **no `CONTENT_SOURCE` setting** in the current application and no `local`/`database` runtime switch to configure.

The browser-local demo workspace remains available only when the explicit development-auth mode is enabled. `DEV_AUTH_ENABLED=true` is rejected in `NODE_ENV=production`, so it cannot act as a production fallback.

## Supported application environment variables

Runtime:
- `DATABASE_URL` — required in production.
- `APP_URL` — required in production and must use HTTPS there.
- `SESSION_COOKIE_NAME` — optional session cookie override.
- `SESSION_TTL_DAYS` — optional session lifetime, 1–365 days.

Database administration:
- `DATABASE_DIRECT_URL` — direct connection used by migration/verification tooling when available.
- `SEED_OWNER_EMAIL` and `SEED_OWNER_PASSWORD` — seed-only credentials.
- `ALLOW_DATABASE_SEED` — one-time seed confirmation; do not persist in Vercel.

Development only:
- `DEV_AUTH_ENABLED`
- `DEV_AUTH_EMAIL`
- `DEV_AUTH_PASSWORD`
- `DEV_AUTH_SECRET`

Vercel-provided release metadata such as `VERCEL_ENV`, `VERCEL_GIT_COMMIT_SHA`, and `VERCEL_DEPLOYMENT_ID` is read automatically and should not be manually recreated.

## Quality workflow correction

The GitHub production-build gate now runs with development authentication disabled and a production-shaped environment contract. This aligns the build step with the existing environment validator.

Rollback checkpoint: **v0.19.0-rc.14**.
