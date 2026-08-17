# Bar Ops — Baseline and Release Integrity

## Current confirmed baseline

- **Version:** `v0.19.0-rc.55`
- **Archive:** `bar-ops-v0.19.0-rc.55-runtime-source-surface-cleanup.zip`
- **SHA-256:** `97d06c614bd4ac2bc29c24c7903c3cdefceda7a7f584e7a07696d06e398e7114`
- **Package version:** `0.19.0-rc.55`
- **Status:** User-confirmed working release candidate
- **Production approved:** No

## Baseline rule

A generated ZIP is not automatically the working baseline.

A version becomes the current confirmed baseline only when:

1. it is derived from the prior confirmed baseline;
2. its scope is documented;
3. application logic changes are disclosed;
4. required checks are honestly recorded;
5. packaging checks pass;
6. the user accepts it or explicitly continues from it.

## Current known release blockers

- the rc.56 capability-parity candidate requires exact-artifact CI and Vercel confirmation before rc.56 promotion;
- PostgreSQL migration and runtime verification are incomplete;
- physical iPhone Safari acceptance is incomplete;
- VoiceOver acceptance is incomplete;
- multi-role authorization acceptance is incomplete;
- backup and restore drill is incomplete.

## Required contents of future release ZIPs

A release ZIP must:

- contain one correct project root;
- include `package.json`;
- include a verified lockfile once dependency resolution is restored;
- include all required migrations;
- include `.env.example`;
- include current version and release markers;
- include the actual changed files;
- exclude `node_modules`;
- exclude `.next`, build output, coverage, and TypeScript caches;
- exclude secrets and real environment files;
- exclude nested historical ZIP files;
- exclude temporary screenshots and work directories;
- be independently extractable as the next source baseline.

## Exact-source promotion rule

The source tested in CI, staged on Vercel, accepted on devices, and promoted to production must be identical.

After any code or configuration change:

- increment the RC version;
- regenerate checksum;
- rerun required gates;
- redeploy the exact artifact;
- repeat affected acceptance tests.

## Minimum final-release gates

Before `v0.19.0` final:

1. clean extraction;
2. deterministic dependency install using lockfile;
3. ESLint pass;
4. full TypeScript pass;
5. current regression suites pass;
6. Next.js production build pass;
7. clean database migration pass;
8. upgrade migration pass;
9. tenant and permission tests pass;
10. Vercel preview pass;
11. critical manager and employee workflows pass;
12. iPhone Safari pass;
13. VoiceOver critical-flow pass;
14. rollback and restore drill pass;
15. defect log contains no unresolved P0/P1 release blockers.

## Documentation ownership

Current operational truth belongs in:

- `MASTER_DEVELOPMENT_BRIEF.md`;
- `ROLE_CAPABILITY_MATRIX.md`;
- `INTENTIONAL_EXCEPTION_REGISTER.md`;
- `REPORTING_SCOPE_AND_SOURCE_TRUST.md`;
- the current release contract and defect log.

Historical release notes should be archived rather than stacked above current setup instructions.

## Phase A result

Phase A changes documentation only.

It does not:

- create a new application version;
- modify package version;
- change permissions;
- change UI;
- change database schema;
- claim production readiness.
