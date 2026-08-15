# Validation log — v0.19.0-rc.35

Baseline: v0.19.0-rc.34.

Passed locally:

- `npm run test:rc35`
- `npm run test:current`
- full inherited regression chain through rc.35
- CSS structural parse/count gate
- release validation
- release artifact audit
- stabilization preflight
- ZIP integrity validation

CSS structural metrics: 25 files, 3,948 declarations, 1,396 rules, 137,224 bytes, 9 `!important` declarations.

Dependency-backed Next.js build/typecheck/lint are not claimed unless executed in an environment with installed dependencies.
