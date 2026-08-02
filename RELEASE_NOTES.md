# Bar Ops v0.11.5 — Floating Navigation

## Floating manager navigation

The former fixed sidebar has been replaced with a bottom-left floating navigation control.

- Collapsed state: fixed black circle with a white menu icon.
- Expanded state: the circle remains fixed, changes to a white close icon, and a white menu panel opens smoothly to the right.
- The menu remains expanded while moving between manager workspaces.
- The page list scrolls vertically inside the panel while the black toggle remains fixed.
- The panel respects iPhone and iPad safe areas.
- Navigation has accessible open/close labels, expanded state and keyboard focus handling.

## Navigation naming

The manager navigation item **Time & attendance** is now named **Timesheets**. The workspace functionality and route key remain unchanged.

## App shell

- The manager content no longer reserves desktop space for the removed sidebar.
- The top bar spans the complete viewport and keeps the location centred.
- Additional bottom spacing prevents the floating menu from covering page controls.
- The previous mobile sidebar, scrim and duplicate sidebar branding are no longer rendered.

## Validation

The complete bundled regression suite passed, including the new floating-navigation checks. No database migration is required.
