# Bar Ops v0.19.0-rc.32 — Manager Shell Single-Owner Consolidation

Baseline: v0.19.0-rc.31.

This release continues the CSS architecture consolidation by making `ManagerShell.module.css` the authoritative owner for the shared manager shell used by Owner, Admin, Manager, and Shift Manager. Legacy sidebar/topbar/navigation branches were removed from `globals.css` and `mono-components.css` rather than overridden again.

## Changes
- Consolidated sidebar positioning, width, navigation layout, profile layout, responsive drawer behavior, location status indicator, notification indicator, and top-bar shell behavior into `ManagerShell.module.css`.
- Removed 73 legacy manager-shell selector branches from global/mono compatibility CSS.
- Ran a same-owner cascade reducer after the move, removing a further 57 superseded declarations from Schedule, Dashboard, and ManagerShell without changing their winning values.
- Preserved the existing shared shell appearance and responsive behavior.
- Added an rc.32 single-owner and CSS-budget regression gate.

## Current CSS position
- 27 CSS files.
- 5,104 parsed declarations.
- 172,331 CSS bytes.
- 10 `!important` declarations.

No database migration, API, permission, workflow, or business-logic changes are included.
