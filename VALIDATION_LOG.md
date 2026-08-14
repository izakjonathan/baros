# v0.19.0-rc.39 Validation

Executed locally:
- `npm run test:rc39` — passed.
- `npm run test:current` — passed after updating the rc.38 architecture test to accept rc.38-or-later while preserving all CSS architecture assertions.
- Vercel production build is the dependency-backed TypeScript/build gate.

The specific rc.39 regression verifies that all four dynamically addressed Attendance status class keys exist in the typed class map and have matching global CSS selectors.

# Validation Log — v0.19.0-rc.39

## Passed

- `npm run test:current`
- `npm run test:rc38`
- `npm run validate:release`
- `npm run audit:artifacts`
- `npm run audit:preflight`
- structural CSS parsing with `tinycss2`: 3 files, 457 rules, 1,518 declarations, 0 parse errors
- TypeScript syntax transpilation across 99 TS/TSX files using TypeScript 5.8.3: 0 syntax failures

## Attempted but not dependency-backed

- `npm run lint` — could not run because local `eslint` dependency is not installed.
- `npm run typecheck` — global `tsc` ran, but React/Next/Postgres/Node project dependencies and type packages are absent, so the output is not a valid project typecheck.
- `npm run build` — could not run because local `next` dependency is not installed.
- `npm install --package-lock-only --ignore-scripts` — attempted so the release could gain a lockfile, but the local environment timed out before completion.

Vercel remains the dependency-backed production build/type gate for this ZIP.
