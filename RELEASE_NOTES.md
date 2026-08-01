# Bar Ops v0.8.0 — Persistent workspace reliability

This release starts the v0.8 production-workspace phase from the confirmed v0.7.6 baseline.

## Employee creation reliability

- Duplicate employee emails now return HTTP 409 instead of a generic internal server error.
- The manager receives an actionable message directing them to the existing Team profile.
- The Add employee dialog remains open after failed saves so entered information is not lost.
- Successful UI updates still wait for the PostgreSQL response.
- Duplicate checks cover both employee creation and email changes on existing employees.

## Build and regression protection

- Preserves the postgres.js transaction and JSON serialization build fixes from v0.7.5–v0.7.6.
- Adds `npm run test:employee-conflicts`.
- Includes the new check in `npm run test:all`.

## Database action

No migration is required. Commit the release to `baros` and allow GitHub Quality Checks and Vercel to deploy it.
