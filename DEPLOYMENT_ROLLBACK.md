# Deployment and rollback — v0.18.15

## Deploy

- Confirm the release ZIP contains no `node_modules`, `.next`, `.vercel`, `vercel.json`, environment secrets, or TypeScript build-info files.
- Confirm Node 24 is selected by the deployment platform.
- Validate `DATABASE_URL`, `APP_URL`, and production authentication settings.
- Run database verification before promoting the deployment.
- Promote only after the preview passes the production acceptance checklist.

## Observe

After promotion, verify login, location selection, Shift Plan, Time & Attendance, Requests, Inventory, Purchase Orders, Daily Operations, employee self-service, and `/api/health/ready`.

## Roll back

The approved rollback checkpoint is **v0.18.14**. Roll back the application deployment first. Database rollback must be handled separately and only when a migration introduced by the failed release requires it. v0.18.15 introduces no schema migration.
