# v0.19.0-rc.104 — Installable Shared Staff Links

## Baseline

- Continued from v0.19.0-rc.103. That release is the rollback checkpoint.

## Included

- Each shared staff Operations URL now supplies its own web manifest, with the exact public URL as its Home Screen start target.
- The manifest is server-validated against the active access token and is returned with `no-store` caching, so a revoked link cannot continue to refresh its installation metadata.
- The global owner/employee manifest and all existing Operations permissions remain unchanged.

No database migration is required. Owner, employee and shared-staff permissions remain unchanged.

Rollback checkpoint: **v0.19.0-rc.103**.
