
## v0.17.0.2 hotfix

- Corrected `DatabaseShiftRecord.employee_availability_conflict` to use `Shift["availabilityConflict"] | null`.
- Confirmed unsupported arbitrary strings can no longer flow into `Shift.availabilityConflict` at the type boundary.
- `npm run test:all`: PASS.
- `npm run audit:preflight`: PASS.
- `npm run validate:release`: PASS.
- Full dependency-based TypeScript/Next.js build not rerun locally; Vercel remains the definitive build gate.
# Bar Ops Validation Log — v0.17.0.2

## Baseline

Approved `bar-ops-v0.16.21.3-audit-remediation.zip`.

## Completed validation

- Corrected the `ClockSettings` TypeScript contract reported by the Vercel build.
- Verified the contract covers every property read or written by the settings workspace.
- Ran the complete `npm run test:all` regression chain after the hotfix: passed.
- Ran `npm run audit:preflight`: passed.
- Ran `npm run validate:release`: passed.

- Audited repository structure and largest responsibility concentrations.
- Extracted workspace domain contracts and pure schedule logic.
- Confirmed extracted schedule utilities contain no `any` usage.
- Added and ran the v0.17.0.2 redesign-readiness regression.
- Ran the complete regression suite: passed.
- Updated architecture-coupled regressions to verify the new feature-owned schedule mapper and forward-compatible v0.17.0.2 version line.
- Ran JavaScript syntax checks for modified regression scripts: passed.
- Ran the final stabilization preflight.
- Ran release-contract validation.
- Confirmed `public/sw.js` is present.
- Confirmed `public/offline.html` and `vercel.json` are absent.
- Verified release archive integrity.

## Dependency-based validation

A clean dependency installation was attempted with `npm install --no-audit --no-fund` but the internal npm mirror returned 404 for `@types/node@22.10.2`. ESLint, TypeScript compilation and the complete Next.js production build could therefore not be executed locally. GitHub Actions and Vercel remain the authoritative dependency-based gates.

## Compatibility

No database migration, API contract change, permission change, business feature, workflow change or intentional visual redesign.