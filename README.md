# Bar Ops v0.16.21.3

Current release: **v0.16.21.3** — Audit Remediation.

This release removes repository drift discovered in the GitHub source audit, repairs regression tests that were coupled to historical version strings or pre-refactor implementation locations, and consolidates release documentation for the redesign baseline.

No database migration, permission change, business feature, API contract change, or workflow change is introduced.

Rollback checkpoint: **v0.16.17**.

Hospitality operations system built with Next.js, TypeScript and PostgreSQL for Vercel and Neon.

## v0.16.21.2 Payroll Row TypeScript Hotfix

The shared organization-scope SQL executor now uses the `postgres` package’s native `Sql<{}>` type. This accepts both the normal client and transaction clients while preserving typed SQL queries and avoiding `any` casts.

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
