# Bar Ops Architecture

Bar Ops is a Next.js App Router application with PostgreSQL-backed operational data.

## Styling architecture

The current CSS contract is intentionally small and single-owner:

1. `styles/tokens.css` — global design tokens only.
2. `app/globals.css` — all shared/global visual rules, including shell, typography, controls, surfaces, forms, dialogs, employee UI, and non-schedule workspace layouts.
3. `features/scheduling/ScheduleWorkspace.module.css` — the only custom feature stylesheet, used solely by the Shift Plan workspace and editor dialogs.

No other feature or route may introduce CSS without an explicit architecture decision. New shared visual behavior belongs in the global system. Shift Plan keeps custom CSS only for schedule-specific grid/card/layout behavior.

Card fundamentals are deliberately limited to `.card` (base surface), `.card-compact` (density), and `.card-flush` (structured panel with child-owned padding). Feature hooks may change tone or composition but not redefine global card geometry. Shift Plan `.shiftCard` is the sole custom card exception.

Shared outer page spacing is owned only by `.page-wrap`; workspace-specific wrappers may not redefine gutters or safe-area padding. The shared single-column shell uses explicit zero-minimum grid tracks so feature min-content cannot widen the document. Shift Plan clips horizontal overflow at its page/workspace boundaries, and only its calendar scroller owns horizontal scrolling. Shared headers use `WorkspaceHeader`, and shared dialogs own their own body/actions structure. Bar Ops is dark-only until a real light theme is implemented globally.

Application behavior remains in the existing React/server/API/database code. The CSS rebuild, rc.41 contract repair, and rc.42 card consolidation do not change business logic.
