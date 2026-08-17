# Development Workflow

1. Start from the latest approved technical ZIP.
2. Inspect the implementation and identify the true owner of the change. Replace/merge/extend that existing owner first; add a new selector/component only when the existing owner cannot represent the required behavior.
3. Keep business behavior unchanged unless the release explicitly changes it.
4. For visual changes, prefer tokens/global primitives. Do not create feature CSS except for Shift Plan without explicit approval.
5. For dependency-backed work, activate the declared npm version with `corepack enable npm` and install the committed graph with `npm ci`; do not use `npm install` unless intentionally changing dependencies and the lockfile together.
6. Run the focused test, current regression suite, release validation, artifact audit, lint, typecheck, and production build when available.
7. Record any unavailable or external gate honestly; never treat lockfile generation alone as a successful clean install.
8. Review the final diff for unrelated changes and package a recoverable ZIP.
