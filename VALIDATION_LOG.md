# v0.19.0-rc.84 Validation

## Confirmed baseline

The v0.19.0-rc.83 release source was used as the baseline for the Operation integrity release.

- Rollback checkpoint: v0.19.0-rc.83

## Implementation

- Corrected selected-date completion, authoritative mutation recovery and role-capability handling.
- Added Copenhagen service dates, month-end recurrence behavior, SVG upload rejection and the RC84 cleanup migration.

## Validation status

- ESLint: passed.
- TypeScript (`tsc --noEmit`): passed.
- Current regression suite: passed.
- UI contract: passed.
- Release validation and artifact audit: passed.
- Next.js 16.2.12 Turbopack production build: passed.

## Scope

Run migration `018_operation_integrity_cleanup.sql` after deployment. It intentionally removes unused governance, reminder, acknowledgement and audit-history schema.
