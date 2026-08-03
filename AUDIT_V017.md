# v0.17.0 release audit

## Source reviewed

The v0.16.1 release was unpacked and its application files, CSS chain, tests, workflows and PWA cleanup path were reviewed before modification.

## Previous problem

v0.16.1 made style delivery deterministic by concatenating tokens, historical geometry, canonical rules and repair rules into one 3,927-line file. That removed file-order uncertainty but preserved internal source-order overrides.

## Remediation

- Extracted semantic variables into `tokens.css`.
- Added a minimal document reset in `reset.css`.
- Isolated retained feature geometry in a low-priority layer.
- Parsed the canonical interface rules and merged repeated selectors within the same at-rule scope, preserving final values.
- Removed obsolete compatibility files.
- Prohibited `!important` in the active styling architecture.
- Added architecture checks for imports, layer ordering, obsolete files and undefined CSS variables.

## Validation completed

- `npm run test:all` passed.
- All active functional, PostgreSQL, authentication, scheduling, payroll and UI contract suites passed.
- CSS variable integrity passed, allowing only Next.js font variables supplied at runtime.
- The root layout still imports one CSS entrypoint.
- Both GitHub workflows remain present.

## Limitation

A full local `next build` was not executed because dependencies are not installed in this isolated runtime. GitHub Quality Checks performs lint, type-check, migration integration tests and the production build.
