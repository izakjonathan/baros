## v0.16.9.1 — Session Cookie TypeScript Hotfix

Built from the approved v0.16.9 Production Hardening IX & X release.

- Preserved the literal Next.js cookie option types for `sameSite: "lax"` and `priority: "high"`.
- Corrected the Vercel TypeScript build failure in employee activation and all other shared session-cookie consumers.
- No database migration, API contract, permission or workflow change.

# Release Notes

## v0.16.9 — Production Hardening IX & X

Built from the approved v0.16.7 Production Hardening VII & VIII baseline.

### v0.16.8 — API Payload Integrity

- Replaced unbounded `Request.json()` parsing with byte-counted streaming JSON reads.
- Enforces route-specific body limits even when `Content-Length` is absent or chunked.
- Rejects unsupported request media types with HTTP 415.
- Rejects invalid `Content-Length`, malformed UTF-8 and malformed JSON safely.
- Preserves the existing shared API error format, request IDs and route-specific size limits.

### v0.16.9 — Database Operations Guardrails

- Aligned the database administration workflow with Node.js 24.
- Added a PostgreSQL advisory lock around migration execution to prevent concurrent migration runs.
- Added migration connection identification, statement timeout and lock timeout settings.
- Ensured advisory-lock and connection cleanup runs after both successful and failed migrations.
- Added focused regression suites for both releases.
- Updated inherited v0.16.6 and v0.16.7 version assertions to remain valid for later releases.

### Compatibility

- No database migration was added.
- No business feature, permission, API route or response contract was intentionally changed.
- Existing JSON API clients must continue sending `Content-Type: application/json`, as the application UI already does.
