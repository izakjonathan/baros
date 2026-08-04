# Bar Ops v0.16.11 — Production Hardening XI & XII

Built from the approved v0.16.9.1 session-cookie TypeScript hotfix baseline.

## v0.16.10 — Authentication Response Hardening

- Added consistent `x-request-id` and `Cache-Control: no-store` headers to login and logout responses.
- Included request IDs in authentication success and failure payloads for operational tracing.
- Added constant-work password verification for unknown accounts through a valid dummy scrypt hash.
- Preserved the existing generic invalid-credentials message and login rate limits.

## v0.16.11 — Session Store Hygiene

- Prunes expired session records during normal production session creation.
- Limits retained active sessions to the ten newest sessions per user and organization.
- Performs session pruning, insertion and retention cleanup in one database transaction.
- Preserves multi-device sign-in and existing session-cookie behavior.

## Compatibility

- No database migration.
- No permission or role changes.
- No business-feature changes.
- No successful API route removal or breaking response change.
