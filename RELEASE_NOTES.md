# Bar Ops v0.16.7 — Production Hardening VII & VIII

Built from the approved v0.16.5 baseline. This package combines two focused production-hardening releases.

## v0.16.6 — Session Lifecycle Hardening

- Centralized session-cookie naming, expiry and security options in one shared module.
- Applied the same cookie policy to normal login, development login and employee activation.
- Added explicit high-priority cookies with both `expires` and `maxAge` values.
- Made logout expire the cookie with matching path and security attributes instead of relying on a generic deletion call.
- Preserved the existing `SameSite=Lax`, HTTP-only and production-secure behavior.
- No database migration or permission change.

## v0.16.7 — CI Runtime Alignment

- Aligned GitHub Actions with the production Node 24 runtime.
- Pinned every direct production and development dependency to an exact version.
- Added regression gates for Node-version drift, dependency ranges and session-cookie duplication.
- Retained `npm install` because the approved baseline does not include a package lock; introducing `npm ci` without a generated lock would break CI.
- Preserved all existing lint, typecheck, regression, environment and production-build gates.

## Compatibility

No business workflow, role permission, API contract or database schema was intentionally changed.
