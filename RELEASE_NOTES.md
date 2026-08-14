# v0.19.0-rc.42 — Card Fundamentals Consolidation

Baseline: **v0.19.0-rc.41**. **v0.19.0-rc.36** remains the technical/functionality rollback checkpoint.

## What changed

- Reduced the global card system to three fundamentals only:
  1. `.card` — the one standard padded surface.
  2. `.card-compact` — density modifier only.
  3. `.card-flush` — removes internal spacing for structured panels whose children own their padding.
- Loading/error/success alignment is now composition on the base card (`shared-state-card`), not a separate card type.
- Removed the obsolete `.panel` surface contract.
- Removed obsolete `card-state`, `card-muted`, and `card-elevated` fundamentals.
- Team, Requests, Attendance, Inventory, Orders, Operations, Settings, Dashboard/Execution and Employee surfaces now compose the same base card.
- Feature hooks such as `team-card`, `clock-card`, `attendance-hero`, and product/order cycling now control only feature layout/tone; they do not own global card padding or radius.
- Employee hero, home tiles, schedule cards, request/history rows, availability rows, hour/timesheet cards, forms, notifications and authentication surfaces now use the shared card fundamentals.
- Metrics now use the compact card fundamental rather than having a second card geometry embedded in `.metrics`.
- The internal React `Card` primitive was simplified to the same `default | compact | flush` density contract.
- Shift Plan remains the sole custom card exception via `ScheduleWorkspace.module.css .shiftCard`.

## Development rule reinforced

Existing code is now the default modification point. New CSS selectors, components, or parallel implementations should only be introduced when the existing owner cannot represent the required behavior. Prefer changing/replacing/merging existing code over adding another layer.

## CSS architecture

Still exactly three CSS files:

1. `styles/tokens.css`
2. `app/globals.css`
3. `features/scheduling/ScheduleWorkspace.module.css`

No database migration required.
