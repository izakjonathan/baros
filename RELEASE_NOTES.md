# Release Notes — v0.16.21.2

## v0.16.21.2 — Payroll Row TypeScript Hotfix

- Fixed the Vercel TypeScript failure when passing a `TransactionSql` client into organization-scope guards.
- Replaced the hand-written SQL executor signature with the native `postgres` `Sql<{}>` type.
- No migration, API, permission, or workflow changes.

# Release Notes — v0.16.21

## Combined releases

### v0.16.20 — Release Metadata Consolidation

Corrected stale and duplicated operational release information. README now has one canonical current-release declaration and one approved rollback checkpoint: v0.16.17.

### v0.16.21 — Final Stabilization Gate

Added a consolidated preflight command and CI gate covering source-package cleanliness, environment-file exclusion, deployment-file invariants, exact direct dependencies, Node 24 alignment, bounded API request parsing, transaction type safety and release-contract consistency.

## Migration

No migration required.

## Rollback

Approved rollback checkpoint: v0.16.17.

### Payroll route typing correction

- Added an explicit `PayrollPeriodRow` contract.
- Typed all transaction query results before audit-log interpolation.
- Removed `unknown` values from typed SQL parameters.
- No runtime, schema, permission, or workflow change.
