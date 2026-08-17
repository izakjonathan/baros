# v0.19.0-rc.56 Validation

## Confirmed baseline

The exact user-confirmed v0.19.0-rc.55 release ZIP was checksum-verified, archive-tested, extracted into a new working directory, and confirmed as package version `0.19.0-rc.55` before modification.

- Archive: `bar-ops-v0.19.0-rc.55-runtime-source-surface-cleanup.zip`
- SHA-256: `97d06c614bd4ac2bc29c24c7903c3cdefceda7a7f584e7a07696d06e398e7114`
- Rollback checkpoint: v0.19.0-rc.55

## Focused source and permission audit

- Remaining authorization-specific management-role arrays and employee exclusions were classified separately from legitimate login, identity-resolution, role-enum, and account-lifecycle decisions.
- Orders, products, requests, shift claims/transfers/notes, shifts, timesheets, audit access, Settings actions, and review-notification audiences now resolve through named capabilities.
- Employee-owned operations retain tenant and linked-employee scoping. Transfer responses select the employee path only when the explicit `accept` operation is present; manager review remains guarded by `requests.review`.
- The final application change contains no CSS, dependency, migration, schema, route-path, or response-shape edit.

## Dependency and release gates

- Runtime: Node 24.19.0 and npm 10.9.2.
- A clean `npm ci --no-audit --no-fund` installed 350 packages from the committed graph.
- Lockfile SHA-256 remained `cc8685874f26992656544bc5611da09afb62e4ade413dba0bce9f5e84d88b751` before and after installation.
- Release validation, release-contract validation, artifact audit before installation, API boundary validation, and final stabilization preflight passed.
- Local environment validation passed with the expected warning that `DATABASE_URL` was absent; the production environment contract also passed with non-secret placeholder URLs.

## Application validation

- ESLint: passed with zero errors and zero warnings.
- TypeScript (`tsc --noEmit`): passed.
- Current regression suite: all 10 suites passed.
- Authentication contract: the executable capability module passed all 120 role/capability decisions for five roles and 24 capabilities, reverse role lookups, and every migrated authorization-surface contract.
- UI contract: passed with exactly three CSS files, 17 active scripts, and zero disconnected runtime modules.
- Condensed React/Next review: passed. The only TSX change is a pure capability lookup with an `AppRole` prop; it adds no effect, state, render loop, client/server boundary leak, accessibility change, or alternate UI owner.
- Next.js 16.2.12 Turbopack production build: passed; all 45 routes were generated or registered successfully.
- No lint rule, TypeScript gate, release check, or regression check was disabled, downgraded, or bypassed.

## Fresh archive verification

- A root-level candidate ZIP passed compressed-data integrity testing and extracted into a new empty directory with an exact source-tree match.
- The fresh extraction repeated `npm ci`, lockfile checksum verification, ESLint, TypeScript, all 10 regression suites, release/preflight and local/production environment contracts, and the 45-route production build successfully.
- The final ZIP differs from that fully verified candidate only by this completed validation record and is rechecked for source-tree identity, package/release identity, forbidden artifacts, and archive integrity after packaging.

## External gates

Live PostgreSQL migration/connectivity, exact-artifact GitHub Actions and Vercel deployment, multi-role account acceptance, physical iPhone Safari, VoiceOver, and backup/restore verification remain external and were not represented as completed locally.

## Scope

This release intentionally changes authorization enforcement to match the approved centralized capability policy. It does not change dependencies, CSS, database migration/schema, visual layout, public route paths, response shapes, or unrelated business workflows.
