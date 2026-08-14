# Bar Ops

Current release: **v0.19.0-rc.42**

Bar Ops is a Next.js operations application for bar scheduling, attendance, team operations, inventory, ordering, requests, and employee self-service.

## CSS architecture

The stylesheet system was rebuilt from scratch in rc.38, repaired for contract integrity in rc.41, and reduced to three card fundamentals in rc.42. There are exactly three CSS files:

- `styles/tokens.css`
- `app/globals.css`
- `features/scheduling/ScheduleWorkspace.module.css`

All shared visual rules are global. Shift Plan is the only feature allowed to own custom CSS, and only for schedule-specific composition/layout. Workspace-specific wrappers must not redefine shared page gutters, safe areas, typography, controls, cards, or dialog structure.


Card surfaces use one standard `.card` plus density modifiers `.card-compact` and `.card-flush`. Feature classes may change tone/composition but do not own card geometry. Shift Plan remains the sole custom card exception.

Bar Ops currently ships dark mode only. A light-theme toggle is not exposed until a real global light theme exists.


## Card system

All non-Shift-Plan surfaces use three global card fundamentals only:

- `.card` — standard card
- `.card-compact` — standard card with reduced internal density
- `.card-flush` — standard card with no internal spacing for composed panels

Colors such as pink, purple, orange, neon, cream, and black are tones applied to the same card primitive, not separate card styles. Shift Plan's `.shiftCard` is the sole custom card exception.

## Rollback checkpoint

Rollback checkpoint: **v0.19.0-rc.36**.

rc.36 is not an approved visual baseline; it is the functionality/recovery checkpoint used for the CSS rebuild.
