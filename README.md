# Bar Ops

**Current release: v0.10.1 — Functional Stabilization** v0.9.1

Hospitality operations system built with Next.js, TypeScript and PostgreSQL for Vercel and Neon.

## iPad workflow
Commit the flat ZIP to the private `baros` repository using the Commit app. GitHub Quality Checks installs dependencies, runs tests/type checking/build, and Vercel deploys the commit.

## Database
Use `DATABASE_URL` for the pooled Neon runtime URL and `DATABASE_DIRECT_URL` for migrations.

For this release no new migration is required.

## Install as an iPhone or iPad app

Bar Ops v0.10.4 includes a web app manifest, Apple metadata, app icons and a service worker. In Safari, open the deployed site, choose **Share → Add to Home Screen**, then launch Bar Ops from its icon. If an older shortcut was installed before v0.10.4, delete it and add it again so iOS picks up the new standalone configuration.

The service worker does not cache authenticated API responses or operational pages. When offline, Bar Ops shows a controlled reconnect screen rather than stale schedule, payroll or inventory data.
