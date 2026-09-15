# v0.19.0-rc.94 Validation

## Confirmed baseline

The v0.19.0-rc.93 release source was used as the baseline for the Operation UI Studio, Work Sans, and public reading release.

- Rollback checkpoint: v0.19.0-rc.93

## Implementation

- Added an owner-only, organization-persistent Canvas/Ink UI Studio inside Operation and scoped it to Operation screens only.
- Added read-only public handbook/news access at `/operation/public/<organization-slug>` with published-image authorization.
- Loaded Work Sans through `next/font/google` and split the pure browser theme helper from server database access.
- Added migration `020_organization_ui_theme.sql`.

## Validation status

- ESLint: passed.
- TypeScript (`tsc --noEmit`): passed.
- Full regression suite (`npm run test:all`): passed.
- Next.js 16.2.12 Turbopack production build: passed.
- Release artifact and stabilization preflight: passed.

## Scope

Apply migration `020_organization_ui_theme.sql` before persisted UI Studio changes are enabled. Production iPad Safari visual confirmation is still required after deployment.
