# Bar Ops Architecture

Bar Ops is a Next.js App Router application with PostgreSQL-backed operational data.

## Dependency architecture

The repository targets Node 24 and npm 10.9.2. Production and development dependency versions are exact in `package.json`, and `package-lock.json` is the authoritative transitive dependency graph. Local and CI installation must use `npm ci`; changing dependency resolution requires an intentional package and lockfile update in the same release.

## Styling architecture

The current CSS contract is intentionally small and single-owner:

1. `styles/tokens.css` — global design tokens only.
2. `app/globals.css` — all shared/global visual rules, including shell, typography, controls, surfaces, forms, dialogs, employee UI, and non-schedule workspace layouts.
3. `features/scheduling/ScheduleWorkspace.module.css` — the only custom feature stylesheet, used solely by the Shift Plan workspace and editor dialogs.

No other feature or route may introduce CSS without an explicit architecture decision. New shared visual behavior belongs in the global system. Shift Plan keeps custom CSS only for schedule-specific grid/card/layout behavior.

Inter and Space Grotesk are repository-owned variable webfont assets loaded once by the root layout through `next/font/local`. Production builds must not depend on Google font downloads; the existing `--font-inter` and `--font-space-grotesk` variables remain the typography contract.

Card fundamentals are deliberately limited to `.card` (base surface), `.card-compact` (density), and `.card-flush` (structured panel with child-owned padding). Feature hooks may change tone or composition but not redefine global card geometry. Shift Plan `.shiftCard` is the sole custom card exception.

Shared outer page spacing is owned only by `.page-wrap`; workspace-specific wrappers may not redefine gutters or safe-area padding. The shared single-column shell uses explicit zero-minimum grid tracks so feature min-content cannot widen the document. Shift Plan clips horizontal overflow at its page/workspace boundaries, and only its calendar scroller owns horizontal scrolling. Shared headers use `WorkspaceHeader`, and shared dialogs own their own body/actions structure. Bar Ops is dark-only until a real light theme is implemented globally.

Application behavior remains in the existing React/server/API/database code. The CSS rebuild, rc.41 contract repair, and rc.42 card consolidation do not change business logic.
