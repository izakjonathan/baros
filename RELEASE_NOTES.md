# Bar Ops v0.16.13 — Production Hardening XIII & XIV

Built from the approved v0.16.11 Production Hardening XI & XII baseline.

## v0.16.12 — Shared Session Issuance

- Added a shared session-store module for token hashing, expired-session pruning, insertion and bounded retention.
- Standard login and employee activation now use the same session persistence rules.
- Employee activation now retains only the ten newest sessions per user and organization, matching standard login.
- Removed duplicated session SQL and token-hashing logic from the activation route.

## v0.16.13 — Authentication Endpoint Consistency

- Added `x-request-id` response headers to employee activation and development login.
- Added `Cache-Control: no-store` to activation and development-login responses.
- Included request IDs in activation JSON success and handled failure responses.
- Preserved redirects, cookies, permissions and existing authentication behavior.

## Compatibility

- No database migration.
- No permission or role changes.
- No business-feature changes.
- No route removal or intentional successful-response break.
