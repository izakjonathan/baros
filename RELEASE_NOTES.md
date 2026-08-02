# Bar Ops v0.13.2 — Layout Recovery

This release repairs the shared layout foundation after the v0.13.0 presentation reconstruction.

## Key repairs

- Added every missing semantic CSS token used by the interface.
- Rebuilt the canonical product stylesheet so it fully owns manager and employee presentation.
- Restored stable mobile layouts for Shift Plan, Timesheets, Team and all dialogs.
- Fixed primary/secondary button variants, including invisible employee-form save labels.
- Reset modal scroll position whenever a dialog opens.
- Added a dedicated modal content wrapper and reliable sticky action footer.
- Kept Start and End fields together while full-width fields span the dialog.
- Rebuilt schedule toolbars, period navigation and day columns for narrow Safari viewports.
- Rebuilt compact Team cards and portal status/actions.
- Rebuilt Timesheets action/filter/metric geometry.
- Preserved the compact floating navigation and low browser placement.
- Added `test:layout-recovery` to the default regression suite.

No database migration is required.
