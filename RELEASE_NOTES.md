# v0.19.0-rc.51 — Feature Dialog Ownership Cleanup

## Baseline
- Continued from v0.19.0-rc.50 after its Commit-app ZIP workflow and Vercel build were confirmed working.

## Cleanup
- Moved `TimesheetDialog`, `EmployeeDialog`, `ProductDialog`, `StockCountDialog`, and `OrderDialog` into the existing Attendance, Team, Inventory, and Orders feature modules.
- Preserved dialog state and all save/invite/persistence callbacks in `components/bar-ops-app.tsx`, so this release changes ownership without changing workflow behaviour.
- Removed the orchestrator's direct dependency on shared dialog primitives plus dialog-only icons and class maps.
- Extended the existing feature-ownership contract to cover all seven extracted feature dialogs.
- Reduced `components/bar-ops-app.tsx` from 37,330 bytes to 26,765 bytes with no new files.

## Scope
No CSS, database, API, authorization, permission, visual, or business-behaviour changes.

Rollback checkpoint: **v0.19.0-rc.50**.
