# Validation Log — v0.19.0-rc.32

Baseline: v0.19.0-rc.31.

Validation performed:
- CSS parse validation with `tinycss2`: no parse errors.
- Full `npm run test:current` after the shell ownership move.
- Same-owner cascade consolidation: 57 superseded declarations removed.
- Focused `npm run test:rc32`.
- `npm run validate:release`.
- `npm run audit:artifacts`.
- `npm run audit:preflight`.
- ZIP integrity validation.

Current CSS metrics: 27 files, 5,104 parsed declarations, 172,331 bytes, 10 `!important` declarations.

The extracted release workspace does not contain installed dependencies, so the dependency-backed Next.js production build remains a Vercel build gate.
