# Bar Ops

Current release: **v0.19.0-rc.38**

Bar Ops is a Next.js operations application for bar scheduling, attendance, team operations, inventory, ordering, requests, and employee self-service.

## CSS architecture

The stylesheet system was rebuilt from scratch in rc.38. There are only three CSS files:

- `styles/tokens.css`
- `app/globals.css`
- `features/scheduling/ScheduleWorkspace.module.css`

All visual rules are global except Shift Plan-specific layout/composition.

## Rollback checkpoint

Rollback checkpoint: **v0.19.0-rc.36**.

rc.36 is not an approved visual baseline; it is the functionality/recovery checkpoint used for the CSS rebuild.
