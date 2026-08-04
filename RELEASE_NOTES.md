# Bar Ops v0.16.5 — Production Hardening V & VI

Built from the approved v0.16.3.1 Vercel Build Hotfix baseline.

## v0.16.4 — Request Boundary Protection

- Added a Next.js 16 `proxy.ts` boundary for all `/api/*` requests.
- Propagates a sanitized `x-request-id` into route handlers and responses.
- Applies `Cache-Control: no-store` to API boundary responses.
- Rejects browser mutation requests marked as cross-site.
- Rejects mutation requests whose `Origin` does not match the deployed request origin.
- Returns safe JSON 403 responses with request IDs.
- Leaves same-origin requests and non-browser requests without an Origin header compatible.

## v0.16.5 — Configuration Integrity

- Validates `DATABASE_URL` as a PostgreSQL URL.
- Requires production `APP_URL` to use HTTPS.
- Rejects credentials embedded in `APP_URL`.
- Restricts `SESSION_TTL_DAYS` to an integer from 1 through 365.
- Validates `SESSION_COOKIE_NAME` characters and length.
- Preserves development warnings for missing databases and insecure non-local HTTP URLs.
- Added focused regression gates for both releases.

## Compatibility

- No database migration.
- No permission changes.
- No business-feature changes.
- No breaking API contract changes for same-origin clients.
- `public/sw.js` remains included.
- `public/offline.html` and `vercel.json` remain absent.
