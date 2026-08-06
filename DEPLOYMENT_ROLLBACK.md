# Deployment and rollback — v0.18.16

## Deploy

- Complete `STAGING_ACCEPTANCE.md` and record the exact staging deployment ID.
- Confirm the release ZIP contains no `node_modules`, `.next`, `.vercel`, `vercel.json`, environment secrets, or TypeScript build-info files.
- Confirm Node 24, `DATABASE_URL`, `APP_URL`, authentication settings, and readiness checks.
- Promote the exact deployment that passed acceptance; do not trigger an unverified rebuild.

## Observe after promotion

Immediately verify login, location selection, Shift Plan, Time & Attendance, Requests, Inventory, Purchase Orders, Daily Operations, employee self-service, and `/api/health/ready`. Confirm one safe write/read cycle for shifts, attendance, stock and requests.

## Roll back

The approved application rollback checkpoint is **v0.18.14**. Roll back the application deployment first. Database rollback is separate and only applies when a failed release introduced a migration. v0.18.16 introduces no schema migration.

Rollback immediately for authentication failure, cross-location data exposure, failed or duplicated writes, incorrect payroll or inventory mutation, broken shift publication, failed readiness health, or another critical workflow regression. Record the incident and preserve deployment logs before retrying promotion.
