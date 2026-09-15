# Bar Ops

Current release: **v0.19.0-rc.95**

Rollback checkpoint: **v0.19.0-rc.94**.

## RC.95 — Operation palette coverage

- Corrected the Operation palette so every card, control, task/Needs view, reader, editor, popover, modal and safe-area canvas derives from the saved Canvas and Ink colors.
- The saved palette is read by every authenticated Operation login and the public read-only route; open Operation pages refresh the shared setting automatically.

## RC.94 — UI Studio and Work Sans

- Owners can save an organization-wide Canvas and Ink palette from the **Operation** module’s UI Studio.
- The palette is scoped to Operation, its handbook/news reader, and editor; shared manager, scheduling, and employee shells keep their existing palettes.
- Saving is owner-authorized, organization-scoped and audited. Apply `db/migrations/020_organization_ui_theme.sql` before enabling the control in production.
- Each organization has a read-only direct URL at `/operation/public/<organization-slug>` for published handbook and news articles. It does not expose Tasks, Needs, editing, or the UI Studio.
- Work Sans is loaded with `next/font/google` as the shared body and display family.
- Operations keeps iPad-safe input sizing and keyboard-aware visual-viewport handling; real iPad Safari acceptance remains required before production sign-off.

Bar Ops is a Next.js operations workspace for hospitality teams. The current architecture uses a global UI system for the manager and employee shells, with Shift Plan and the standalone Operation module as the only custom CSS Module exceptions.

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
- `features/operation/` — standalone Operation module for handbook, news, daily tasks, and We Need
- `features/employees/` — Team workspace and employee dialog
- `features/settings/` — Settings
- `features/control/` — Control Centre

CSS remains limited to `styles/tokens.css`, `app/globals.css`, `features/scheduling/ScheduleWorkspace.module.css`, and `features/operation/OperationModule.module.css`.
