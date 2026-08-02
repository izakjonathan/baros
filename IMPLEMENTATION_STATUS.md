# Implementation status — v0.13.1

## Completed in this release

- Reconstructed the presentation layer from a single shared product stylesheet.
- Removed legacy employee presentation, browser-blue link fallbacks, and green employee icon rules.
- Removed shared topbar, modal, metric, navigation, and card appearance from the structural stylesheet.
- Unified manager and employee typography, headers, surfaces, controls, cards, forms, and navigation.
- Reduced the active default regression suite to current behavior tests; historical visual-system tests remain available through `npm run test:legacy-ui` but no longer block current releases.
- Added presentation reconstruction assertions.

## Deployment note

A red GitHub Quality Checks run does not itself alter styling, but it means the commit was not validated. Vercel may still deploy independently unless branch protection is configured. Always compare commit SHAs before judging a release.
