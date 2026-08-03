# Bar Ops v0.14.0 — Design System Reset

This release resets the shared interface geometry while preserving the existing application, API and PostgreSQL behaviour.

## Rebuilt
- Header, page spacing and overlay positioning
- Notifications and search popovers
- Dashboard metrics, attention rows and quick actions
- Team cards and employee actions
- Settings tabs and custom monochrome switches
- Timesheets action toolbar, filters and metric layout
- Shift Plan toolbar, period navigation, publish control and calendar density
- Add/Edit Shift and Add/Edit Employee dialog scrolling and sticky actions
- Manager floating navigation and employee bottom navigation

## Architecture
`interface-v014.css` is loaded last and is the canonical interface layer. The new regression check validates the stylesheet import, required component ownership and CSS structure.

No database migration is required.
