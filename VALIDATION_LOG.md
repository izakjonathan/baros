# v0.19.0-rc.122 Validation

## Confirmed baseline

The verified rc.121 mobile news typography release was used as the baseline.

- Rollback checkpoint: v0.19.0-rc.121

## Implementation

- Replaced the mobile dock's fixed corner radii with full capsule radii.
- Lowered the dock by reducing—but not removing—the iPhone safe-area offset.
- Added Operations contract assertions for the dock geometry and vertical position.

## Validation status

- ESLint: passed.
- TypeScript (`tsc --noEmit`): passed.
- Operations regression suite (`npm run test:operation`): passed.
- Next.js 16.2.12 Turbopack production build: passed.

## Scope

No database migration is required. Production iPhone/iPad Safari visual confirmation remains required after deployment.
