# v0.18.13 Full Visual QA Contract

This release treats Bar Ops as one product rather than a collection of redesigned workspaces.

## Audited surfaces

- Manager shell, top bar, sidebar and mobile navigation
- Dashboard, Shift Plan, Time & Attendance, Team, Shift Execution
- Inventory, Purchase Orders, Requests, Daily Operations and Settings
- Employee Home, Schedule, Hours, Availability, Requests and Notifications
- Login, activation, loading, empty, success and error states
- Dialogs, sheets, popovers, toasts and sticky action footers

## Shared corrections

1. **Typography:** page titles share a compact responsive scale; supporting copy has a readable maximum measure; long operational content may wrap instead of expanding cards.
2. **Controls:** interactive controls share a 44px minimum physical target. Icon-only controls use the same square target.
3. **Focus:** keyboard focus is visible throughout manager, employee, authentication and modal surfaces.
4. **Containment:** cards, controls, labels, actions and temporal inputs remain shrinkable. Dense data scrolls inside its own wrapper rather than widening the page.
5. **Transient UI:** dialogs, sheets, popovers and toasts are bounded by the visual viewport and safe-area gutters.
6. **States:** loading, empty and error surfaces use compact, consistent proportions and centered readable copy.
7. **Ownership:** this stylesheet owns only recurring cross-product contracts. Feature CSS Modules continue to own feature presentation and internal composition.

## Prohibited compensations

Do not hide overflow on page parents, use negative margins to counter intrinsic widths, add an opposite transform, or duplicate feature selectors in the shared QA layer. Correct the element, track or transient surface that produces the defect.
