# Bar Ops

**Current release: v0.16.13 — Production Hardening XIII & XIV**

Hospitality operations system built with Next.js, TypeScript and PostgreSQL for Vercel and Neon.

## Current release

v0.16.13 combines shared session issuance with authentication endpoint consistency. Standard login and employee activation now use the same bounded session-store implementation, and activation/development-login responses carry consistent request tracing and no-store cache protection.

No database migration, permission change or business-workflow change is required.

## iPad workflow

Commit the flat ZIP to the private `baros` repository using the Commit app. GitHub Quality Checks installs dependencies, runs tests, type checking and the production build, then Vercel deploys the commit.

## Database

Use `DATABASE_URL` for the pooled Neon runtime URL and `DATABASE_DIRECT_URL` for migrations.

## Production health checks

- `GET /api/health/live` checks application liveness without requiring the database.
- `GET /api/health/ready` checks bounded database readiness.
- `GET /api/health` remains a backwards-compatible readiness alias.

## Installed app

The web app manifest, Apple metadata, icons and `public/sw.js` remain included. The service worker does not cache authenticated API responses or operational pages.
