# Bar Ops v0.11.3 — Request Targeting and Monthly Availability

Built from v0.11.2.

## Fixed

- Employee handover and swap approval controls are now shown only to the target employee.
- The requesting employee still sees the outgoing request and status in exchange history, but cannot approve their own request.
- Unrelated employees remain excluded by the existing organization and employee query scope.

## Added

- Month and year selection for employee availability.
- One availability row for every calendar date in the selected month.
- Per-date available/unavailable controls and optional start/end times.
- Previous/next month navigation.
- Mark-all controls and copy-one-date-to-all support.
- Monthly date-specific persistence using the existing `availability_rules.valid_from` and `valid_until` columns.
- Recurring weekly availability remains available as a separate mode and provides defaults when a month has no saved date override.

## Database

No migration is required. The existing availability schema already supports date-specific rules.
