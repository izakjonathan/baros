# Implementation Status

## Current release

Bar Ops v0.16.19 — Production Hardening XIX & XX

## v0.16.18 — API Boundary Completion

- Replaced the remaining direct `Request.json()` calls in attendance alerts, schedule templates and security actions with the shared bounded JSON parser.
- Added explicit request-size, media-type, UTF-8 and JSON-object enforcement to those routes.
- Added bounded UUID, string, enum and object-array validation before database access.
- Added organization-location validation to schedule-template creation.
- Preserved request IDs and no-store error handling through the shared API error response.

## v0.16.19 — Type-Safety Stabilization

- Removed transaction `as any` casts from the hardened order and payroll routes.
- Replaced untyped payroll transaction rows with record-shaped rows.
- Added a shared SQL row contract for organization-scope guards.
- Added focused regression gates for remaining unbounded parsers and transaction type escapes.

## Baseline and compatibility

- Baseline: approved v0.16.17
- Database migration: none
- Permissions: unchanged
- Business workflows: unchanged
- Service worker: preserved
- Rollback checkpoint: v0.16.17
