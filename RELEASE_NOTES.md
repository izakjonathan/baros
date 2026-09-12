# v0.19.0-rc.68 — Operation Storage Save Feedback

## Baseline

- Continued from v0.19.0-rc.67 after the Operation Quill rich text editor release. That release is the rollback checkpoint.

## Storage feedback

- Added an explicit migration-required state for the Operation module when production has not applied `014_operation_module.sql`.
- Changed Operation article, daily-task, and needed-item mutations to return a clear `503` storage message when the Operation tables or enum types are missing.
- Kept article drafts, task text, and needed-item text visible when a save fails instead of clearing inputs after a rejected request.
- Disabled write controls while the migration-required fallback is active and shows a visible database migration notice.
- Added API and UI regression coverage for the migration-required storage path.

## Scope

No database-schema, dependency-version, route-shape, permission, visual redesign, or existing business-workflow changes are included. The change is limited to Operation module save feedback and request handling when the production database has not yet been migrated.

Rollback checkpoint: **v0.19.0-rc.67**.
