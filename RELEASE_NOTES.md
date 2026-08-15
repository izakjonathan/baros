# v0.19.0-rc.49 — Decomposition Dependency & Shared UI Cleanup

## Fixed
- Attendance now imports the existing `canonicalShiftDate` helper from `features/workspace/schedule-utils`.
- Restored all other imports omitted during the workspace decomposition: shared surface class maps, schedule conflict helper, existing order data, and required Lucide icons.
- Moved the default time-clock settings constant out of Team and into Settings, its actual owner.

## Cleanup
- Removed eight duplicate `PageHeader` adapters; feature workspaces render the shared `WorkspaceHeader` directly.
- Consolidated four duplicate `PanelTitle` implementations into `components/ui/workspace-ui.tsx`.

## Scope
No CSS, database, API, authorization, permission, or business-behaviour changes.

Rollback checkpoint: **v0.19.0-rc.48**.
