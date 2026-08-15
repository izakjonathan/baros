# v0.19.0-rc.50 — Attendance Build Repair & Orchestrator Cleanup

## Fixed
- Restored the missing Lucide `History` import used by the Attendance export-history heading. Vercel had compiled rc.49 successfully before TypeScript resolved `<History />` to the DOM `History` class and rejected its JSX attributes.
- Added a current UI-contract scan for capitalized JSX components without runtime bindings so this extraction error class is caught locally.

## Cleanup
- Moved Shift Plan add/edit dialogs and their schedule-specific CSS-module ownership from `components/bar-ops-app.tsx` to `features/scheduling/ScheduleDialogs.tsx`.
- Removed local Sidebar, Topbar, Modal, and ModalActions adapters; the orchestrator now uses the existing shared components directly.
- Removed stale imports, two orphaned Attendance helpers from Shift Plan, an unused login router, and one unused formatter left behind by earlier extraction.
- Reduced `components/bar-ops-app.tsx` from 51,613 bytes to approximately 37 KB.

## Scope
No CSS, database, API, authorization, permission, or business-behaviour changes.

Rollback checkpoint: **v0.19.0-rc.49**.
