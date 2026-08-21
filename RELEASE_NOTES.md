# v0.19.0-rc.56 — Request-Aware API Error Responses

## Baseline
- Continued from the exact v0.19.0-rc.55 ZIP verified with clean dependency-backed lint, typecheck, regression, and production build gates. That release is the rollback checkpoint.

## API error context cleanup
- Updated API route catch paths to pass the incoming `Request` object to `jsonError`.
- Preserved request IDs, no-store response headers, and server error log path context consistently when API routes fail.
- Kept existing status-code mapping, response body shape, authorization checks, route structure, and business logic unchanged.

## Regression protection
- Extended API-integrity coverage to scan every `app/api/**/route.ts` file for bare `jsonError(error)` calls.
- Kept the existing release artifact, preflight, release-contract, lint, typecheck, regression, and build gates unchanged.

## Scope
No dependency version, CSS, database migration/schema, route shape, authorization rule, permission, layout, visual direction, or business workflow changed. Application-source edits are limited to request-aware API error response handling and the corresponding source contract.

Rollback checkpoint: **v0.19.0-rc.55**.
