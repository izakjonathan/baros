# v0.19.0-rc.99 Validation

## Confirmed baseline

The verified rc.98 Today-first Home release was used as the baseline.

- Rollback checkpoint: v0.19.0-rc.98

## Implementation

- Expanded Today news cards with the readable body extracted from published article content.
- Removed the three-item rendering limit so the feed remains scrollable when several updates are published.

## Validation status

- ESLint: passed.
- TypeScript (`tsc --noEmit`): passed.
- Operations regression suite (`npm run test:operation`): passed.
- TypeScript and ESLint: passed.
- Next.js 16.2.12 Turbopack production build: passed.

## Scope

No database migration is required. Production iPhone/iPad Safari visual confirmation remains required after deployment.
