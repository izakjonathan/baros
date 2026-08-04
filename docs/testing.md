# Testing

## Required release gates

Run in this order from a clean Node 24 checkout:

```bash
npm install --no-audit --no-fund
npm run audit:preflight
npm run validate:release
npm run test:all
npm run lint
npm run typecheck
npm run build
```

Regression tests protect behavior and architectural invariants. They must be forward-compatible with later versions and should test shared contracts rather than obsolete source locations.

## Phase D requirement

Every redesign release must continue to run `test:v0170-redesign-readiness` so domain contracts, pure schedule logic, design tokens, service-worker expectations and redesign documentation remain intact.
