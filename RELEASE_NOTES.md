# Bar Ops v0.9.1 — Full-system stabilization

This release audits and stabilizes the v0.9.0 codebase without adding another major module.

## Main corrections
- Dynamic current-week and current-month calendar anchors replace the fixed July/August 2026 anchors.
- Shift timestamps are displayed in the venue timezone rather than by slicing UTC ISO strings.
- PostgreSQL shift bootstrap and shift mutation responses now include the location timezone.
- Copy Previous Week now persists copied shifts to PostgreSQL instead of changing browser state only.
- Production stock-count approval now persists changed quantities before reporting success.
- Local development storage moves to schema version 2 while reading the prior key for compatibility.
- PostgreSQL client configuration adds connection timeout, connection lifetime and application name.
- CSP no longer contains unused Supabase browser endpoints.
- Stale generated TypeScript build metadata and superseded audit documents were removed.
- Package metadata now correctly identifies v0.9.1.

## Validation
Run `npm run test:all`, `npm run typecheck`, and `npm run build` in GitHub Quality Checks.
