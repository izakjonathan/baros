# Release Notes — v0.17.0.2

## Schedule availability type hotfix

- Narrowed the extracted database availability-conflict field to the existing `Shift["availabilityConflict"]` union.
- Preserved the only supported values: `APPROVED_TIME_OFF`, `OUTSIDE_AVAILABILITY`, or no conflict.
- Fixed the Vercel TypeScript failure in `mapDatabaseShift` without changing runtime behavior.
- No migration or redesign scope change.

## TypeScript hotfix

- Corrected the extracted `ClockSettings` contract so it matches the existing time-clock settings UI and API.
- Restored the fields for mobile, kiosk, unscheduled clocking, location verification, rounding and auto-approval.
- Removed three stale fields that were never used by the current settings implementation.
- No runtime behavior or redesign scope changed.

## Architecture Cleanup & Redesign Readiness

- Extracted workspace types from the manager application shell into `features/workspace/types.ts`.
- Extracted date, overnight, overlap, conflict and shift mapping logic into `features/workspace/schedule-utils.ts`.
- Added a typed `DatabaseShiftRecord` boundary and removed `any` from the extracted pure schedule layer.
- Documented architecture ownership and stable Phase D boundaries.
- Added a cross-workspace screen, component and state inventory for the redesign.
- Added testing and development workflow documentation.
- Added `test:v0170-redesign-readiness` and included it in the full regression chain.

## Migration

No migration required.

## Rollback

Approved rollback checkpoint: v0.16.21.3.