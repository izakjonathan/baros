# v0.19.0-rc.87 Validation

## Confirmed baseline

The v0.19.0-rc.86 release source was used as the baseline for the minimal article-editor controls release.

- Rollback checkpoint: v0.19.0-rc.86

## Implementation

- Reduced the top selector typography and exposed Add new category in the menu.
- Removed the format dock’s enclosing surface.

## Validation status

- ESLint: passed.
- TypeScript (`tsc --noEmit`): passed.
- Operation regression suite: passed.
- Next.js 16.2.12 Turbopack production build: passed.

## Scope

No database migration is required. Production iOS visual confirmation is required after deployment.
