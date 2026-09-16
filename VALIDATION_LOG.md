# v0.19.0-rc.101 Validation

## Confirmed baseline

The verified rc.100 Owner News Controls release was used as the baseline.

- Rollback checkpoint: v0.19.0-rc.100

## Implementation

- Added compact structured published-text rendering for Today news cards without changing editor styles.
- Added validated internal article links, reader-stack navigation and a bottom back circle for linked articles.
- Replaced Home’s completed task icon with an unchecked box.

## Validation status

- ESLint: passed.
- TypeScript (`tsc --noEmit`): passed.
- Operations regression suite (`npm run test:operation`): passed.
- TypeScript and ESLint: passed.
- Next.js 16.2.12 Turbopack production build: passed.

## Scope

No database migration is required. Production iPhone/iPad Safari visual confirmation remains required after deployment.
