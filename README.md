# Bar Ops

**Current release: v0.10.5 — Cleanup & Release Consolidation**

Bar Ops is a Next.js, TypeScript and PostgreSQL hospitality operating system designed for Vercel, Neon and an iPad-first deployment workflow.

## Deploy from iPad

1. Commit the flat ZIP to the private `baros` repository with the Commit app.
2. GitHub Quality Checks installs dependencies, runs the regression suite, lint, type-check and production build.
3. Vercel deploys the accepted commit.

## Database

Use `DATABASE_URL` for the pooled Neon runtime connection and `DATABASE_DIRECT_URL` for migrations. v0.10.5 adds no migration.

## Install on iPhone or iPad

Open the deployed site in Safari and choose **Share → Add to Home Screen**. Bar Ops launches in standalone mode with Apple Home Screen metadata, app icons and a safe network-first service worker. Authenticated APIs and operational page responses are never cached.

## Release boundaries

Core scheduling, employee access, attendance, payroll foundations, products and inventory use PostgreSQL-backed routes. Daily Operations and the full purchase-order editor remain staged workflows; see `IMPLEMENTATION_STATUS.md`.
