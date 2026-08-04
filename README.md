# Bar Ops v0.16.21

Current release: **v0.16.21**.

This release combines **v0.16.20 — Release Metadata Consolidation** and **v0.16.21 — Final Stabilization Gate**. It removes stale release information from the operational documentation and adds one consolidated source-package preflight before the existing CI quality gates.

No database migration, permission change, business feature, or workflow change is introduced.

Rollback checkpoint: **v0.16.17**.

Hospitality operations system built with Next.js, TypeScript and PostgreSQL for Vercel and Neon.

## Final stabilization checkpoint

The project is now at the planned checkpoint before Phase D — Complete Visual Redesign. The preflight verifies release metadata, exact direct dependency versions, Node 24 alignment, required deployment files, forbidden generated/secret files, bounded API request parsing and the absence of transaction `any` escapes.

The preflight complements rather than replaces the existing full regression, lint, type-check, environment-validation and production-build gates.

## Rollback checkpoint

The approved rollback checkpoint is **v0.16.17 — Production Hardening XVII & XVIII**. If a later stabilization release introduces a production issue, redeploy the Git commit containing v0.16.17, verify `/api/health/live`, `/api/health/ready` and `/api/health`, then confirm one owner and one employee login before restoring traffic.

No database rollback is required for v0.16.18 through v0.16.21 because those releases introduce no migrations.

## iPad workflow

Commit the flat ZIP to the private `baros` repository using the Commit app. GitHub Quality Checks runs the final stabilization preflight, release-contract validation, regression suites, linting, type checking, environment validation and the production build before Vercel deploys the commit.

## Database

Use `DATABASE_URL` for the pooled Neon runtime URL and `DATABASE_DIRECT_URL` for migrations.

## Production health checks

- `GET /api/health/live` checks application liveness without requiring the database.
- `GET /api/health/ready` checks bounded database readiness and reports duration.
- `GET /api/health` remains a backwards-compatible readiness alias.
- Health payloads include the application version, environment and shortened deployment commit, but no secrets or database connection details.

## Installed app

The web app manifest, Apple metadata, icons and `public/sw.js` remain included. The service worker does not cache authenticated API responses or operational pages.
