# v0.19.0-rc.94 — Operation UI Studio, Work Sans, and public reading

## Baseline

- Continued from v0.19.0-rc.93. That release is the rollback checkpoint.

## Included

- Added an owner-only UI Studio in Operation for a per-organization canvas and ink palette.
- Limited that palette to Operation and its reader/editor for every role; the rest of Bar Ops keeps its existing colors.
- Added a direct no-login URL for published handbook and news only. Tasks, Needs and owner actions remain authenticated.
- Added the Work Sans Google font through Next’s font loader.
- Split the server theme data helper from the client theme helper so the production build keeps PostgreSQL out of the browser bundle.

Apply `db/migrations/020_organization_ui_theme.sql` before allowing persisted UI Studio changes.

Rollback checkpoint: **v0.19.0-rc.93**.
