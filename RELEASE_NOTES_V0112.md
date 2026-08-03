# Bar Ops v0.11.2 — Build Syntax Fix

Baseline: v0.11.1 Self-Service Integrity.

## Fixed

- Corrected the malformed JSX expression in the manager top-bar inventory notification action.
- Restored successful parsing of `components/bar-ops-app.tsx` by closing the `onClick` expression before the button child content.

## Scope

This release contains no workflow, database, API, styling, or behavior changes beyond the syntax correction required for the production build.

## Validation

- Complete inherited source-level regression suite.
- Focused v0.11.2 syntax regression.
- JavaScript syntax checks for test scripts.
- ZIP integrity validation.

No database migration is included or required.
