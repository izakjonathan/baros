# v0.19.0-rc.5 — Type Safety, Test Cleanup & Build Reproducibility

## Changes

- Added a typed manager-bootstrap contract and runtime shape validation for required response collections.
- Removed localized `any` mappings from manager bootstrap and request-queue data mapping.
- Added typed request, claim, transfer, invitation, product, employee, timesheet, and shift-note records.
- Replaced an avoidable schedule non-null assertion with an explicit unavailable-period guard.
- Split current release gates from preserved historical release assertions.
- Kept historical tests available through `npm run test:historical` without allowing obsolete visual assertions to define the current interface.
- Documented the test-suite ownership model and remaining lockfile blocker.

## Reproducibility status

A public-registry lockfile generation attempt failed with DNS error `EAI_AGAIN`. No lockfile was fabricated. CI remains on `npm install` until a genuine lockfile can be generated and proven with `npm ci`.

## Excluded

- no redesign;
- no CSS consolidation;
- no database migration;
- no broad manager-shell decomposition;
- no production-readiness claim.
