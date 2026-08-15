# Bar Ops

Current release: **v0.19.0-rc.49**

Rollback checkpoint: **v0.19.0-rc.48**.

Bar Ops is a Next.js operations workspace for hospitality teams. The current architecture uses a global UI system with Shift Plan as the sole custom CSS exception, and manager workspaces are now split by feature/domain rather than implemented inside one monolithic client component.

## Development

Use the latest approved ZIP as the baseline. Prefer changing/replacing existing owners before adding new code. See `AGENTS.md` and `docs/development-workflow.md`.

## Current source structure

- `components/bar-ops-app.tsx` — application orchestration/state only
- `features/dashboard/` — Today’s operations / Shift execution overview
- `features/scheduling/` — Shift Plan
- `features/attendance/` — Time & attendance
- `features/inventory/` — Inventory
- `features/orders/` — Orders
- `features/operations/` — Daily Operations
- `features/employees/` — Team
- `features/settings/` — Settings
- `features/control/` — Control Centre

CSS remains exactly three files: `styles/tokens.css`, `app/globals.css`, and `features/scheduling/ScheduleWorkspace.module.css`.
