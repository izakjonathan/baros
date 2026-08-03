# Bar Ops v0.10.9 — Production Typecheck Gate

Built directly from the approved v0.10.8 audit package.

## Scope

This release addresses the concrete production TypeScript failure reported by Vercel in `app/api/employee/hours-summary/route.ts`.

## Changes

- Added an explicit result-row contract to the employee timesheet SQL query.
- Removed the callback-only `{ id: string }` annotation that conflicted with the generic PostgreSQL `Row` type.
- Preserved the existing API response and employee-hours behavior.
- Added `scripts/test-v0109-build-gate.mjs` to guard the query-boundary typing pattern.
- Updated version compatibility across inherited regression checks.

## Validation status

The available source-level regression suite is expected to pass locally.

A complete dependency-backed `next build`, ESLint run and TypeScript run could not be executed in the packaging environment because its configured npm mirror does not provide the required packages. An attempt to generate a lockfile from the public npm registry also timed out. The supplied Vercel deployment is therefore the authoritative next production-build gate.

No lockfile has been fabricated or inferred.
