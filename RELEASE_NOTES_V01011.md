# Bar Ops v0.10.11 — Employee Timesheet Rendering

Built from v0.10.10.

## Fixed

- Normalizes PostgreSQL `date` values before employee timesheet formatting, including full ISO timestamp responses.
- Prevents invalid or malformed date values from throwing during Clock-page rendering.
- Guards the timesheet response before mapping it in the UI.
- Converts Safari geolocation denial, unavailable-position and timeout failures into readable inline errors.
- Adds explicit `type="button"` declarations to Clock-page actions and dialog controls.
- Adds a route-specific recovery boundary that reassures employees that a recorded clock event is not lost.

## Scope

No database migration, clock mutation, manager-shell change or unrelated redesign is included.
