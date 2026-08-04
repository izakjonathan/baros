# Release Notes — v0.17.0

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
