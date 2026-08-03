# Bar Ops v0.11.1 — Self-Service Integrity

Baseline: v0.11.0 Employee Self-Service Foundation.

## Production defects corrected

- Shift claim, handover, swap, and employee response requests now use bounded request handling with a 15-second timeout.
- Failed requests always leave the saving state and display the API or connection error inline.
- Duplicate submissions are blocked while a request is in flight.
- Transfer dialog state is reset whenever it is opened.
- Swap-shift choices are filtered to the employee currently selected in the dialog.
- Changing the selected employee clears any previously selected swap shift.
- Swap choices are restricted to future, published, assigned shifts.
- Active employees remain valid transfer targets regardless of their operational title, including bar managers.
- The manager Requests workspace is now surfaced from the Overview attention panel, Quick actions, top-bar notifications, sidebar navigation, search, and `?workspace=requests` deep links.
- Timesheet approval writes `approved_by` through an explicit PostgreSQL UUID expression, correcting the production type error.

## Scope boundaries

No database migration, schema change, scheduling conflict integration, or unrelated visual redesign is included.
