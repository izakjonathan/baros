# Bar Ops Architecture

Bar Ops is a Next.js App Router application with PostgreSQL-backed operational data.

## Styling architecture

The current CSS contract is intentionally small:

1. `styles/tokens.css` — global design tokens only.
2. `app/globals.css` — all shared/global visual rules, including shell, typography, controls, surfaces, forms, dialogs, employee UI, and non-schedule workspace layouts.
3. `features/scheduling/ScheduleWorkspace.module.css` — the only custom feature stylesheet, used solely for Shift Plan composition.

No other feature or route may introduce CSS without an explicit architecture decision. New shared visual behavior belongs in the global system. Shift Plan keeps custom CSS only for schedule-specific grid/card/layout behavior.

Application behavior remains in the existing React/server/API/database code. The rc.38 CSS rebuild does not change business logic.
