# Bar Ops

Current release: **v0.19.0-rc.41**

Bar Ops is a Next.js operations application for bar scheduling, attendance, team operations, inventory, ordering, requests, and employee self-service.

## CSS architecture

The stylesheet system was rebuilt from scratch in rc.38 and repaired for contract integrity in rc.41. There are exactly three CSS files:

- `styles/tokens.css`
- `app/globals.css`
- `features/scheduling/ScheduleWorkspace.module.css`

All shared visual rules are global. Shift Plan is the only feature allowed to own custom CSS, and only for schedule-specific composition/layout. Workspace-specific wrappers must not redefine shared page gutters, safe areas, typography, controls, cards, or dialog structure.

Bar Ops currently ships dark mode only. A light-theme toggle is not exposed until a real global light theme exists.

## Rollback checkpoint

Rollback checkpoint: **v0.19.0-rc.36**.

rc.36 is not an approved visual baseline; it is the functionality/recovery checkpoint used for the CSS rebuild.
