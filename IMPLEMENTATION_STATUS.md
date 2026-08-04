# Bar Ops Implementation Status — v0.17.0.1

## Baseline

Built from the approved v0.16.21.3 Audit Remediation release.

## v0.17.0.1 hotfix

- Aligned the centralized `ClockSettings` domain contract with the current settings workspace and `/api/settings/time-clock` route.
- Preserved all existing defaults, persistence fields and UI behavior.

## Architecture cleanup

- Extracted reusable workspace domain contracts from `components/bar-ops-app.tsx`.
- Extracted pure schedule/date/conflict/database mapping logic into a feature-owned module.
- Replaced the untyped database-shift mapping input with an explicit contract.
- Preserved the existing manager and employee UI output and all business workflows.
- Kept the application shell intact rather than performing a risky wholesale rewrite.

## Redesign readiness

- Confirmed `app/mono-tokens.css` as the canonical visual-token entry point.
- Added architecture and stability-boundary documentation.
- Added a complete manager/employee/shared-state redesign inventory.
- Added testing and development-workflow documentation.
- Added a v0.17.0.1 regression gate protecting the extracted domain layer and Phase D boundaries.

## Compatibility

- No database migration.
- No API route removal or contract change.
- No role or permission change.
- No business-feature or workflow change.
- No intentional visual redesign.
- `public/sw.js` remains included.
- `public/offline.html` and `vercel.json` remain absent.
