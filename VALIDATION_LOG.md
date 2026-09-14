# v0.19.0-rc.85 Validation

## Confirmed baseline

The v0.19.0-rc.84 release source was used as the baseline for the Operation task-visibility release.

- Rollback checkpoint: v0.19.0-rc.84

## Implementation

- Fixed creation when the optional task instruction is blank.
- Added persisted audiences for specific employee, everyone scheduled for the service date, and everyone independent of the shift module.

## Validation status

- ESLint: passed.
- TypeScript (`tsc --noEmit`): passed.
- Current regression suite: passed.
- UI contract: passed.
- Release validation and artifact audit: passed.
- Next.js 16.2.12 Turbopack production build: passed.

## Scope

Run migration `019_operation_task_assignment_scope.sql` after deployment. Existing individual assignments are preserved; all other existing tasks become Everyone.
