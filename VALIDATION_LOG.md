# Validation Log — v0.16.3.1

- Confirmed `app/api/health/route.ts` declares `dynamic` locally rather than re-exporting route config.
- Confirmed the compatibility route delegates `GET` to the readiness implementation.
- Confirmed `package.json` pins Node `24.x`.
- Focused v0.16.3 regression executed after updating its forward-compatible version/runtime assertion.
- v0.16.0, v0.16.1, and v0.16.2 focused regressions passed.
- Full local `next build` could not run because the available npm mirror returned 404 for `@types/node`; Vercel must perform the dependency-based build gate.

## Previous v0.16.3 validation

Baseline: v0.16.1.1 TypeScript Build Hotfix.

## Passed

- `npm run test:v0153-mobile-ipad`
- `npm run test:v0160-runtime`
- `npm run test:v0161-guardrails`
- `npm run test:v0162-abuse-protection`
- `npm run test:v0163-health-runtime`
- New regression-script JavaScript syntax checks
- Confirmed `public/sw.js` remains included
- Confirmed `public/offline.html` remains absent
- Confirmed `vercel.json` remains absent
- ZIP integrity verification

## Not executed locally

- `npm run lint`
- `npm run typecheck`
- `npm run build`

The approved project package does not include installed dependencies. These dependency-based checks must run in GitHub Actions or Vercel. No claim is made that they passed locally.
