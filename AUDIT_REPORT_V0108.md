# Bar Ops v0.10.8 — Baseline Audit and Verification

## Scope

This audit was performed against the approved `bar-ops-v0.10.7-employee-workspace-integrity.zip` baseline. No application behavior was changed. v0.10.8 adds audit evidence, inventory, validation records and release metadata only.

## Baseline fingerprint

- 145 baseline files were classified and hashed.
- One flat project root was confirmed; no nested duplicate project was found.
- The baseline manifest is `BASELINE_MANIFEST_V0107.sha256`.
- The classified inventory is `REPOSITORY_INVENTORY_V0108.csv`.
- The project contains 30 API route files, 14 employee route/UI files, 10 sequential SQL migrations, 40 regression scripts, two GitHub workflows and six PWA/static assets.

## Confirmed working by available automated checks

All existing source-level regression suites passed, including scheduling logic, payroll export safeguards, tenant/location context, employee invitation and activation, employee workspace linkage, time clock, inventory operations, PWA configuration, CSS ownership and the v0.10.6–v0.10.7 targeted fixes.

These checks demonstrate that the expected implementation patterns are present and internally consistent. They do not replace real PostgreSQL, production-build or browser execution.

## Critical findings

No critical defect was proven by the available static and source-level checks.

A production-ready approval cannot yet be issued because three critical verification gates remain unavailable: reproducible dependency installation, fresh PostgreSQL migration/workflow execution and real-browser end-to-end testing.

## High-risk findings

### H1 — No dependency lockfile

`package.json` exists, but neither `package-lock.json` nor another supported lockfile is included. Consequently, `npm ci` fails immediately and the dependency graph is not reproducible.

**Impact:** A later install can resolve different transitive versions, and the required clean-install validation cannot run.

**Recommended release:** Create the lockfile in an environment with normal npm registry access, review it, then run the complete validation pipeline without changing application behavior.

### H2 — Production build, lint and TypeScript validation are not proven

The ZIP contains no installed dependencies. `npm run lint` and `npm run build` cannot locate ESLint or Next.js. `npm run typecheck` starts through a globally available compiler but fails primarily because React/Next modules and type declarations are absent.

**Impact:** Source-level tests pass, but compilation, framework integration and lint correctness remain unverified.

### H3 — Database behavior has not been executed against fresh PostgreSQL

The repository contains migrations `001` through `010`, database setup scripts and numerous database-oriented source assertions. No disposable PostgreSQL service was available for this audit.

**Impact:** Migration ordering, actual constraints, transaction behavior, rollback behavior, concurrent claims, payroll locks and tenant isolation have not been proven by execution.

### H4 — Browser and iOS/PWA behavior remains unverified

Manifest, service worker, safe-area and responsive rules are covered by source assertions, but the application was not run in Safari, standalone iOS mode or the required viewport matrix.

**Impact:** Visual regressions, keyboard behavior, safe-area behavior, modal scrolling and service-worker lifecycle issues could remain despite passing static tests.

## Moderate findings

### M1 — Manager UI is concentrated in one very large component

`components/bar-ops-app.tsx` is approximately 105 KB and 703 lines, combining bootstrap, routing-like workspace selection, schedule, team, inventory, attendance, dialogs and persistence wiring.

**Risk:** Active implementation ownership is difficult to trace, focused changes affect a broad file, and future regression isolation is harder.

**Recommendation:** Do not refactor broadly. Extract one proven domain at a time only after browser/database baselines exist.

### M2 — Styling remains concentrated in large global files

`app/globals.css` is approximately 68 KB and 5 minified lines; `app/mono-components.css` is approximately 24 KB and 772 lines. Existing CSS ownership tests confirm no exact repeated selectors and no `!important`, but broad ownership remains difficult to maintain.

**Recommendation:** Preserve the current approved appearance. Future UI releases should trace component → selector → token ownership before editing.

### M3 — Explicit `any` remains in core routes and UI mapping

Static scanning found explicit `any` usage in manager bootstrap, shifts, shift transfers, payroll export, products and the manager application mapper.

**Risk:** Database response-shape drift can avoid compile-time detection.

**Recommendation:** Replace incrementally with route/domain result types when those files are next changed; do not perform a repository-wide type rewrite.

### M4 — Documentation has contradictory release metadata

`README.md` still identifies v0.10.1 as the current release while describing later versions. `RELEASE_NOTES.md` says v0.10.7 was built directly from v0.10.5, omitting v0.10.6. Historical audit files are useful but can be mistaken for current status.

**Recommendation:** Establish one current release index and clearly label historical reports.

### M5 — Recommended architecture documentation is incomplete

The repository has useful historical reports but does not include the full recommended maintained set: `AGENTS.md`, `docs/architecture.md`, `docs/testing.md`, `docs/development-workflow.md`, `docs/decisions/` and `docs/plans/`.

**Recommendation:** Add these as documentation-only work after the reproducible build gate, using the audited implementation rather than an aspirational rewrite.

## Confirmed architecture and security properties

Available checks confirm explicit development authentication, no automatic owner fallback, organization/location scoping patterns, random expiring invitation tokens, scrypt password/PIN handling, transactional employee activation, transaction use in mutation routes, security headers, persistent schedule publishing, approved-only payroll export and explicit employee-linkage validation.

These are implementation confirmations, not a penetration test or runtime authorization proof.

## Areas that must not be changed yet

- Do not redesign the owner top bar until a browser reference pack exists.
- Do not split `bar-ops-app.tsx` as a general cleanup exercise.
- Do not consolidate CSS merely to reduce file size.
- Do not rewrite migrations or squash migration history.
- Do not weaken employee/location validation to make development preview easier.
- Do not remove historical tests because they appear version-specific.

## Recommended repair order

1. **v0.10.9 — Reproducible build gate:** create and commit a lockfile; run clean install, lint, typecheck, full tests and production build.
2. **v0.10.10 — PostgreSQL execution audit:** apply all migrations to a disposable database and execute critical tenant, concurrency and transaction workflows.
3. **v0.10.11 — Browser reference pack:** verify manager and employee workflows across required viewport sizes, Safari and installed PWA mode.
4. **v0.10.12 — Critical/high findings only:** repair defects proven by steps 1–3.
5. **Later focused releases:** owner workspace polish and incremental architecture/type cleanup.

## Approval status

v0.10.7 remains the application-behavior baseline. v0.10.8 is approved as an audit evidence package only. The application is not yet eligible for a “production verified” designation because dependency, PostgreSQL and browser gates remain open.
