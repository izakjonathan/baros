# v0.19.0-rc.48 — Workspace Header Contract Wiring Fix

## Fixed
- Corrected feature-owned workspace header adapters created during the rc.45 decomposition.
- `WorkspaceHeader` accepts `description` and `actions`; extracted workspaces were still forwarding the old local adapter names as `subtitle` and `action`.
- Updated Attendance, Inventory, Daily Operations, Settings, Control Centre, Team, Dashboard/Shift Execution, and Orders.

## Scope
No CSS, database, authorization, API, or business-behaviour changes.

Rollback checkpoint: **v0.19.0-rc.47**.
