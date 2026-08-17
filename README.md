# Bar Ops

Current release: **v0.19.0-rc.56**

Rollback checkpoint: **v0.19.0-rc.55**.

Bar Ops is a Next.js operations workspace for hospitality teams. The current architecture uses a global UI system with Shift Plan as the sole custom CSS exception, and manager workspaces are now split by feature/domain rather than implemented inside one monolithic client component.

## Development

Use the latest approved ZIP as the baseline. Prefer changing/replacing existing owners before adding new code. The repository pins Node 24, npm 10.9.2, exact dependency versions, and a lockfile; use `corepack enable npm` followed by `npm ci` for dependency-backed work. See `AGENTS.md` and `docs/development-workflow.md`.

## Current source structure

- `components/bar-ops-app.tsx` — application orchestration, shared state, API coordination, and feature-dialog callbacks
- `features/dashboard/` — Today’s operations / Shift execution overview
- `features/scheduling/` — Shift Plan workspace and editor dialogs
- `features/attendance/` — Time & attendance workspace and correction dialog
- `features/inventory/` — Inventory workspace and product/stock-count dialogs
- `features/orders/` — Orders workspace and purchase-order dialog
- `features/operations/` — Daily Operations
- `features/employees/` — Team workspace and employee dialog
- `features/settings/` — Settings
- `features/control/` — Control Centre

CSS remains exactly three files: `styles/tokens.css`, `app/globals.css`, and `features/scheduling/ScheduleWorkspace.module.css`.

Authorization is centralized in `lib/auth/capabilities.ts`. Route handlers enforce named capabilities for manager reads and mutations while employee self-service remains scoped to the authenticated user's linked employee record.
