# v0.19.0-rc.95 — Operation palette coverage

## Baseline

- Continued from v0.19.0-rc.94. That release is the rollback checkpoint.

## Included

- Removed the fixed Operations accent and success colors that bypassed the saved Canvas/Ink pair.
- The palette now covers normal Operations screens, Tasks, Needs, reader, editor, format menus, UI Studio and the safe-area canvas for authenticated and public users; existing open sessions refresh the saved setting.
- The shared manager, employee, settings and scheduling surfaces remain intentionally unchanged.

Apply `db/migrations/020_organization_ui_theme.sql` before allowing persisted UI Studio changes.

Rollback checkpoint: **v0.19.0-rc.94**.
