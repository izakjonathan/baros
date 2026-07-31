# v0.3.9 — Time & attendance foundation

- Manager Time & attendance workspace with period and employee filters.
- Scheduled, completed worked, and pending-approval totals.
- Per-employee scheduled versus approved worked-hour summaries.
- Employee My hours page with clock in, break, clock out, period totals and timesheet history.
- PostgreSQL tables for settings, timesheets, immutable punch events and breaks.
- Employee time-clock API and manager timesheet query/approval API.
- Audit-friendly model: punch events are preserved separately from corrected/approved timesheets.
- Database-free UI remains usable with demo attendance state.
