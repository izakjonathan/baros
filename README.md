# Bar Ops

Current release: **v0.19.0-rc.70**

Rollback checkpoint: **v0.19.0-rc.69**.

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
