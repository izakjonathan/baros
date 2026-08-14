# Bar Ops Architecture

Bar Ops is a Next.js App Router application with PostgreSQL-backed operational data.

## Styling architecture

The current CSS contract is intentionally small and single-owner:

1. `styles/tokens.css` — global design tokens only.
2. `app/globals.css` — all shared/global visual rules, including shell, typography, controls, surfaces, forms, dialogs, employee UI, and non-schedule workspace layouts.
3. `features/scheduling/ScheduleWorkspace.module.css` — the only custom feature stylesheet, used solely for Shift Plan composition.

No other feature or route may introduce CSS without an explicit architecture decision. New shared visual behavior belongs in the global system. Shift Plan keeps custom CSS only for schedule-specific grid/card/layout behavior.

Shared outer page spacing is owned only by `.page-wrap`; workspace-specific wrappers may not redefine gutters or safe-area padding. Shared headers use `WorkspaceHeader`, and shared dialogs own their own body/actions structure. Bar Ops is dark-only until a real light theme is implemented globally.

Application behavior remains in the existing React/server/API/database code. The CSS rebuild and rc.41 contract repair do not change business logic.
