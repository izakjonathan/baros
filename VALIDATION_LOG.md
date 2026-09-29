# v0.19.0-rc.126 Validation

## Confirmed baseline

The rc.125 confirmed task-details release was used as the baseline.

- Rollback checkpoint: v0.19.0-rc.125

## Implementation

- Added tolerant JSON decoding for task checklist, checklist-completion, and image values.
- Applied one decoder across server-rendered, refreshed API, and shared-link task states.
- Preserved strict task creation confirmation and incomplete-row cleanup.
- Added structured mismatch diagnostics and compatibility regression coverage.

## Validation status

- ESLint: passed.
- TypeScript (`tsc --noEmit`): passed.
- Operations regression suite (`npm run test:operation`): passed.
- Next.js 16.2.12 Turbopack production build: passed.

## Scope

Database migration `023_operation_task_images.sql` is required. Production iPhone/iPad Safari visual confirmation remains required after deployment.
