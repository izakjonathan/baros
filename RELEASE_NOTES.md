# Bar Ops v0.19.0-rc.13 — Employee Mobile Polish & Integrity

Built from v0.19.0-rc.12.

## Changes
- Fixes employee Availability time-control overflow on iPhone by stacking the paired native time fields at phone widths.
- Improves employee Hours contrast on coloured cards with explicit semantic foreground colours.
- Derives closed timesheet worked minutes from clock-in, clock-out and break timestamps at the API boundary, preventing stale/corrupt stored totals from producing implausible employee-hour displays and approved summaries.
- Constrains workspace search to the visible mobile viewport and makes its results independently scrollable when the iOS keyboard is open.

No database migration is required. No new feature scope is introduced.
