# Bar Ops v0.16.19 — Production Hardening XIX & XX

Built from the approved v0.16.17 Production Hardening XVII & XVIII baseline.

## v0.16.18 — API Boundary Completion

- Completed adoption of the shared streamed and bounded JSON parser across the remaining legacy mutation routes.
- Attendance-alert resolution now validates the alert UUID before executing the organization-scoped update.
- Schedule-template creation now validates its location against the authenticated organization and bounds template name, description and item count.
- Security actions now validate action names, GDPR request types, session identifiers and password-reset email length before database access.
- Authentication and API errors retain request correlation and no-store response behavior.

## v0.16.19 — Type-Safety Stabilization

- Removed avoidable transaction `any` casts from purchase-order and payroll-period mutations.
- Replaced untyped payroll result arrays with record-shaped transaction rows.
- Added focused regression checks preventing the hardened routes from returning to direct `Request.json()` or transaction `any` escapes.

## Compatibility

- No database migration.
- No role or permission changes.
- No business-feature additions.
- No route removal or intentional successful-response break.
- `public/sw.js` remains included; `public/offline.html` and `vercel.json` remain absent.
