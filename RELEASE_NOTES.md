# Bar Ops v0.8.9 — Settings and Production Time Clock

## Settings workspace

The sidebar Settings control now opens a real workspace. It includes organization/location context, persistent per-location time-clock settings, and security/data status. Owners, admins and managers can configure mobile clocking, kiosk clocking, unscheduled clocking, location checks, early-clock windows, missed-clock-out thresholds, rounding and optional approval tolerance.

## Persistent employee time clock

My Hours now uses PostgreSQL instead of demo React state. Clock-in, break start/end and clock-out call the production API. An open clock and active break are restored after refresh or sign-in. Clock-in links to the nearest eligible published shift where possible and respects the selected location's mobile and unscheduled-clock settings.

## Hours and correction requests

Scheduled hours are calculated from published shifts. Approved worked hours are calculated from approved timesheets. Timesheet history is loaded from PostgreSQL and employee correction requests are persisted and notify managers.

## Role behaviour

Clocking is available to any authenticated user who has a linked employee profile and location, regardless of whether their organization role is Employee, Shift Manager, Manager, Admin or Owner. Management permission alone does not create an attendance identity. Managers can open My Hours from Settings.

## Database

No new migration is required. The release uses the existing time_clock_settings, timesheets, time_events, time_breaks and timesheet_correction_requests tables.
