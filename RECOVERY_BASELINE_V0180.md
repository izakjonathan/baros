# Bar Ops v0.18.0 — Stable Interface Recovery

This release deliberately restores the complete v0.10.6 interface and component architecture as the trusted visual baseline.

## Recovery rules

- No presentation-layer code from v0.11.0–v0.17.0 is included.
- The v0.10.6 page shell, navigation, cards, dialogs, typography, tokens and responsive rules remain intact.
- The service-worker cache namespace is rotated to v0.18.0.
- Future functionality must be ported into this baseline incrementally, with build and visual regression checks after each change.

## Verification

Run:

```bash
npm install
npm run typecheck
npm run build
```
