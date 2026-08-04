# Validation Log — v0.18.1

## Baseline

- Approved baseline: v0.17.0.2
- Combined release: v0.18.0 + v0.18.1

## Passed

- `node scripts/test-v0180-design-system.mjs`
- `node scripts/test-v0181-shell-navigation.mjs`
- Complete inherited regression chain through v0.15.0
- Complete v0.15.0–v0.18.1 regression chain
- `npm run audit:preflight`
- `npm run validate:release`
- Release-contract validation
- Service worker present
- `public/offline.html` absent
- `vercel.json` absent
- ZIP integrity

One inherited v0.15.0 regression was updated to verify the workspace context by semantic class/ARIA presence rather than requiring the exact pre-CSS-Module `className` string. The protected workspace-context behavior remains unchanged.

## Not run

- Clean dependency installation
- ESLint
- TypeScript compilation
- Complete Next.js production build
- Vercel deployment
- Browser/device visual verification

These dependency- and browser-based gates were not available in this build environment and must not be inferred from the static regression results.
