# Bar Ops v0.19.0-rc.15 — Environment & Configuration Integrity

## Changes

- Audited all application-owned environment-variable references.
- Confirmed that `CONTENT_SOURCE` is obsolete and unsupported; no replacement `CONTENT_SOURCE=database` value is needed.
- Clarified `.env.example` so PostgreSQL is the canonical production data source.
- Preserved explicit development-only local demo persistence, while documenting that it cannot run as a production fallback.
- Corrected the GitHub quality workflow so the production build uses `DEV_AUTH_ENABLED=false` rather than enabling development authentication.
- Added a focused configuration-integrity regression test.
- Reduced current release documentation to current-state information instead of carrying historical release prose forward.

## Scope

No UI, business logic, database schema, API contract, permission, or operational workflow changes.

No database migration is required.
