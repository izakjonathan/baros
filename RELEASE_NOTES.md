# v0.19.0-rc.54 — Deterministic Dependencies and Lint Cleanup

## Baseline
- Continued from the exact v0.19.0-rc.53 ZIP confirmed working after successful Vercel deployment. That release remains the rollback checkpoint.

## Dependency and CI correction
- Added lockfile v3 generated from the repository's exact dependency declarations with Node 24.19.0 and npm 10.9.2.
- GitHub Actions now activates `npm@10.9.2` through Corepack and uses `npm ci`, keyed to `package-lock.json`, instead of recalculating dependency resolution with `npm install`.
- The lockfile resolves every direct production and development dependency and records integrity metadata for all registry packages.
- The ESLint configuration no longer imports an export absent from the pinned ESLint version, and the TypeScript include list now contains the generated Next.js development types path requested by Next.js 16.2.12.

## Lint and type-safety correction
- Resolved the complete ESLint result—24 errors and 9 warnings—without disabling, downgrading, or bypassing a rule.
- Added concrete Postgres row and executor types in the affected API routes, replaced explicit `any` failure handling with `unknown` narrowing, and made the shared client persistence boundary generic and typed.
- Corrected effect lifecycles for URL, local-storage, availability, hours, request, schedule-acknowledgement, and settings synchronization; async work now has stable dependencies and cancellation where applicable.
- Removed unused props, icon plumbing, and state that had no runtime effect. The condensed React/Next review found no new hydration, accessibility, component-ownership, or rendering issue.

## Regression protection
- The existing release artifact audit validates the lockfile structure, package identity, direct dependency pins, registry resolutions, and integrity records.
- Existing release, preflight, and release-contract gates protect the declared npm version and deterministic CI command.

## Scope
No dependency version, CSS, database migration/schema, API contract, authorization rule, permission, layout, visual direction, or business workflow changed. Application-source edits are limited to lint, lifecycle, and type-safety repairs that preserve runtime behavior.

Rollback checkpoint: **v0.19.0-rc.53**.
