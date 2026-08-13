# Bar Ops v0.19.0-rc.17 — Employee Schedule UI Refinement

Current release: **v0.19.0-rc.17**

This release applies a focused employee Schedule UI refinement on top of the completed rc.16 closeout audit. It removes redundant heading copy and standardizes shift-card actions as smaller black/cream single-line controls without changing schedule behavior.

## Closeout correction

The live application canvas was already black, but `app/manifest.ts` still advertised the legacy cream background/theme color for installed PWA launch surfaces. Both manifest colors are now `#000000`, matching the application and viewport theme colors.

## Workspace coverage

The audit covers the role families used by Bar Ops:

- Owner
- Admin
- Manager
- Shift Manager
- Employee / Bartender

Manager-capable roles continue to share the manager workspace shell and employee self-service continues to use the same shared sidebar/topbar primitives through the employee shell.

## Production data/configuration

Production remains PostgreSQL-backed through `DATABASE_URL`. `CONTENT_SOURCE` is not supported or required. Development authentication remains forbidden in production.

## Acceptance

Source-level closeout checks are included in `test:rc16`. Physical-device verification on iPhone/iPad Safari and the dependency-backed Vercel build remain the final external acceptance gates.

Rollback checkpoint: **v0.19.0-rc.16**.
