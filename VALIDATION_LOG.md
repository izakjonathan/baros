# Validation Log — v0.16.5

Baseline: v0.16.3.1 Vercel Build Hotfix.

## Passed

- `node scripts/test-v0160-runtime-resilience.mjs`
- `node scripts/test-v0161-operational-guardrails.mjs`
- `node scripts/test-v0162-request-abuse-protection.mjs`
- `node scripts/test-v0163-health-runtime.mjs`
- `node scripts/test-v0164-request-boundary.mjs`
- `node scripts/test-v0165-config-integrity.mjs`
- Valid production configuration accepted by `scripts/validate-environment.mjs`
- Production HTTP `APP_URL` correctly rejected
- Confirmed Node engine remains `24.x`
- Confirmed `public/sw.js` remains included
- Confirmed `public/offline.html` remains absent
- Confirmed `vercel.json` remains absent
- ZIP integrity verification

## Not executed locally

- `npm run lint`
- `npm run typecheck`
- `npm run build`

The approved source package does not include installed dependencies or a lockfile. Dependency-based checks must run in GitHub Actions or Vercel. No claim is made that they passed locally.
