# Bar Ops v0.16.3 — Production Hardening III & IV

Built from the approved v0.16.1.1 TypeScript Build Hotfix baseline.

## v0.16.2 — Request Abuse Protection

- Replaced string-based rate-limit failures with a typed `RateLimitError`.
- Added accurate `Retry-After` response headers for throttled requests.
- Added request IDs and `no-store` headers to shared 429 responses.
- Applied the shared rate-limit response path to login, employee activation, kiosk verification and security actions.
- Preserved existing limits and permissions.

## v0.16.3 — Runtime & Health Probes

- Added a dependency-free liveness endpoint at `/api/health/live`.
- Added a bounded database-readiness endpoint at `/api/health/ready`.
- Kept `/api/health` backwards compatible as the readiness endpoint.
- Added a four-second readiness timeout to avoid hanging health checks.
- Sanitized inbound request IDs before they are included in logs or responses.
- Disabled the `X-Powered-By` response header.
- Added HSTS and DNS-prefetch security headers.
- Pinned the production Node.js runtime to Node 20 instead of allowing automatic major-version upgrades.

## Compatibility

- No database migration.
- No permission changes.
- No business feature changes.
- No breaking API changes.
- `public/sw.js` remains included.
- `public/offline.html` and `vercel.json` remain absent.
