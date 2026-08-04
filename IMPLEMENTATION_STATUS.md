# Implementation Status

## Current release

Bar Ops v0.16.17 — Production Hardening XVII & XVIII

## v0.16.16 — Operational Observability

- Added centralized release metadata derived from the package version and Vercel deployment environment.
- Added privacy-safe version and shortened commit diagnostics to liveness and readiness responses.
- Added release-identification headers to API responses.
- Added structured informational and warning server-log helpers alongside existing error logging.
- Added readiness duration measurement and structured readiness events.
- Preserved no-store behavior and request correlation identifiers.

## v0.16.17 — Release & Recovery Guardrails

- Added an executable release-contract validator.
- Added the release validator to GitHub Quality Checks before regression, lint, typecheck and build gates.
- Enforced package/document version alignment.
- Enforced Node 24 workflow alignment.
- Enforced `public/sw.js` presence and continued absence of `vercel.json` and `public/offline.html`.
- Documented v0.16.15.1 as the approved rollback checkpoint and the minimum rollback verification steps.

## Baseline and compatibility

- Baseline: approved v0.16.15.1
- Database migration: none
- Permissions: unchanged
- Business workflows: unchanged
- Service worker: preserved
