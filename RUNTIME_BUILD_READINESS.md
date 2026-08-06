# Runtime Build Readiness — v0.19.0-rc.8

## Purpose

This release prepares the repository for deterministic installation and staging without claiming gates that could not run.

## Added

- explicit public npm registry configuration in `.npmrc`;
- exact dependency-save policy;
- pinned package manager metadata (`npm@10.9.2`);
- source-level runtime-build readiness verifier;
- focused rc.8 regression;
- documented exact staging sequence.

## Dependency resolution attempt

A package-lock-only installation was attempted with:

```bash
npm install --package-lock-only --ignore-scripts --registry=https://registry.npmjs.org
```

The command timed out. A direct registry lookup for `@types/node@22.10.2` also timed out because the execution environment could not resolve or reach the public registry. Previous attempts reported `EAI_AGAIN` DNS failures.

No package lock was fabricated.

## Current blocker

`package-lock.json` is not available. Therefore the following cannot honestly be marked complete:

- deterministic `npm ci`;
- dependency-backed ESLint;
- complete TypeScript validation;
- Next.js production build;
- exact-artifact Vercel staging.

## Required external staging sequence

Run from a clean extraction with public npm access:

```bash
npm install --package-lock-only
npm ci
npm run audit:artifacts
npm run audit:preflight
npm run validate:release
npm run test:current
npm run lint
npm run typecheck
npm run validate:env
npm run build
npm run verify:runtime-build
```

Commit the generated lockfile without changing dependency versions. Then repeat `npm ci` and every quality gate from a second clean extraction.

## Scope protection

This release does not change:

- application behaviour;
- visual design;
- CSS ownership;
- database schema;
- permissions;
- APIs;
- employee or manager workflows.
