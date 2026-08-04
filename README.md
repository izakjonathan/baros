# Bar Ops

**Current release: v0.16.17 — Production Hardening XVII & XVIII**

Hospitality operations system built with Next.js, TypeScript and PostgreSQL for Vercel and Neon.

## Current release

v0.16.17 combines operational observability with release and recovery guardrails. Health responses and structured server logs now identify the running application version, deployment environment and sanitized Vercel commit reference. Readiness checks also record bounded execution duration.

The release pipeline now validates package/document version alignment, required deployment files, forbidden legacy files, Node 24 workflow alignment and rollback documentation before the main quality gates run.

No database migration, permission change or business-workflow change is required.

## Rollback checkpoint

The approved rollback checkpoint is **v0.16.15.1 — Order Route TypeScript Hotfix**. If v0.16.17 introduces a production issue, redeploy the Git commit containing v0.16.15.1, verify `/api/health/live`, `/api/health/ready` and `/api/health`, then confirm one owner and one employee login before restoring traffic.

Do not roll back database migrations for this release because v0.16.16 and v0.16.17 introduce none.

## iPad workflow

Commit the flat ZIP to the private `baros` repository using the Commit app. GitHub Quality Checks validates the release contract, installs dependencies, runs tests, linting, type checking, environment validation and the production build before Vercel deploys the commit.

## Database

Use `DATABASE_URL` for the pooled Neon runtime URL and `DATABASE_DIRECT_URL` for migrations.

## Production health checks

- `GET /api/health/live` checks application liveness without requiring the database.
- `GET /api/health/ready` checks bounded database readiness and reports duration.
- `GET /api/health` remains a backwards-compatible readiness alias.
- Health payloads include the application version, environment and shortened deployment commit, but no secrets or database connection details.

## Installed app

The web app manifest, Apple metadata, icons and `public/sw.js` remain included. The service worker does not cache authenticated API responses or operational pages.
