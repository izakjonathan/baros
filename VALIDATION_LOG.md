# v0.19.0-rc.53 Validation

## Confirmed baseline
The complete v0.19.0-rc.52 ZIP was integrity-tested, extracted into a new working directory, and verified as version `0.19.0-rc.52` before modification. That release remains the rollback checkpoint.

## Vercel evidence and correction
- Vercel built commit `283e6b1` as `bar-ops@0.19.0-rc.52`.
- The failure occurred during optimized production compilation, before TypeScript validation.
- Google returned HTTP 404 for Space Grotesk weights 500, 600, and 700. The subsequent Turbopack internal-font module failures were downstream errors.
- Both configured Google font loaders were audited. Inter and Space Grotesk now use repository-owned local variable webfonts so the full error class is removed from the build path.
- The existing CSS variables, font families, extended-Latin coverage, and weight ranges are preserved.

## Asset integrity
- Inter axes: optical size 14–32 and weight 100–900.
- Space Grotesk axis: weight 300–700.
- Required English, Danish, punctuation, and currency glyph coverage was verified in both bundled assets.
- SIL Open Font License notices are packaged beside both fonts.

## Validation status
- PASS `node scripts/test-shift-logic.mjs`
- PASS `node scripts/test-payroll-export.mjs`
- PASS `node scripts/test-integrity.mjs`
- PASS `node scripts/test-production-foundation.mjs`
- PASS `node scripts/test-inventory-operations.mjs`
- PASS `node scripts/test-remediation.mjs`
- PASS `node scripts/test-auth-contract.mjs`
- PASS `node scripts/test-api-integrity.mjs`
- PASS `node scripts/test-release-contract.mjs`
- PASS `node scripts/test-ui-contract.mjs` (3 CSS owners, 17 active scripts, local-font contract)
- PASS `node scripts/validate-release.mjs`
- PASS `node scripts/check-release-artifacts.mjs`
- PASS `node scripts/preflight-stabilization.mjs`
- PASS JavaScript/MJS syntax checks across the repository
- PASS balanced-block checks for all three CSS owners
- PASS WOFF format, variable-axis, Unicode coverage, and required-glyph checks for both font assets
- PASS source audit: no TypeScript or TSX file imports `next/font/google`

The candidate contains 183 files. Relative to rc.52, the scoped change is limited to the root font loader, four bundled font/license files, the UI contract, release metadata, and canonical documentation. No CSS owner or database migration changed.

## Dependency-backed limitation
The extracted release contains no `node_modules` or lockfile, and the local ESLint, TypeScript, and Next.js executables are unavailable. Those dependency-backed commands were therefore not claimed as local passes. The Vercel deployment remains the production Next.js build gate; unlike rc.52, that build no longer requires Google-hosted font resources.
