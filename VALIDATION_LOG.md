# v0.19.0-rc.104 Validation

## Confirmed baseline

The verified rc.103 Editorial Today News release was used as the baseline.

- Rollback checkpoint: v0.19.0-rc.103

## Implementation

- Added a public-link-specific web manifest and nested metadata override for the shared staff Operations route.
- The manifest's start URL and scope are the validated shared-link URL, avoiding the authenticated app root when launched from Home Screen.

## Validation status

- ESLint: passed.
- TypeScript (`tsc --noEmit`): passed.
- Operations regression suite (`npm run test:operation`): passed.
- Next.js 16.2.12 Turbopack production build: passed.

## Scope

No database migration is required. Production iPhone/iPad Safari visual confirmation remains required after deployment.
