# Testing

`npm run test:current` runs the current business/security/integrity regression set plus the rc.38 CSS architecture contract and the rc.41 CSS contract-integrity gate.

The rc.38 CSS test verifies:
- exactly three CSS files;
- only Shift Plan uses a CSS Module;
- global ownership of shell, controls, cards, metrics, and employee presentation;
- no release-patch comments in CSS;
- reduced-motion is the only accepted use of `!important`.

Historical tests remain available through `npm run test:historical`, but old tests that assert superseded CSS implementations are not part of the current release gate.

Vercel is the dependency-backed production build gate when local `node_modules` are unavailable.

The rc.41 gate additionally verifies single-owner gutters/safe areas, shared Dialog/state/header contracts, Shift Plan editor ownership, mapped class integrity, dark-only theme behavior, and the documented global-error exception.
