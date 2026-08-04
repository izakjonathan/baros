# Release Notes

## v0.16.1 — Production Hardening I & II

This combined build includes the first two Production Hardening releases:

### v0.16.0 — Runtime Resilience
- Added application-level, root-level and not-found recovery screens.
- Added safe retry guidance that avoids implying a failed mutation succeeded.
- Added structured server error logging with request identifiers.
- Added request identifiers to shared API error responses.
- Added a non-sensitive `/api/health` database-readiness endpoint with no-store caching.

### v0.16.1 — Deployment & Operational Guardrails
- Added production environment validation for database, application URL, development authentication and session TTL configuration.
- Added the environment contract to the GitHub quality workflow.
- Added focused regression suites for both Production Hardening releases.
- Preserved `public/sw.js` and confirmed that `public/offline.html` and `vercel.json` remain absent.
- Updated inherited forward-release assertions without weakening their functional checks.

No database migration, permission change, API contract change or new business module is included.
