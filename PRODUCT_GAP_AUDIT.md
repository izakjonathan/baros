# Product gap audit — v0.4.1

## Implemented in this release
- Explicit review → approval → export workflow.
- Single and bulk approval for the selected period.
- CSV export restricted to approved timesheets.
- Export aggregated by employee with employee details, number of approved timesheets, and total approved hours.
- Custom from/to dates and employee filter.
- Database-backed export route with organization and optional location scoping.
- Consistent module and mobile density pass.

## Essential next functions
### Payroll integrity
- Manager edit/correction UI with mandatory reason and immutable before/after history.
- Unapprove/reopen control with permission and export-lock safeguards.
- Closed pay periods so exported periods cannot change silently.
- Export run history, generated-by metadata, checksum, and re-download.
- Paid/unpaid break rules, rounding, supplements, overtime and public-holiday rules.
- Payroll IDs and configurable salary/pay codes.

### Attendance exceptions
- Missing clock-out, early/late punch, unscheduled clock-in, overlapping timesheet and excessive-shift alerts.
- Employee correction request rather than direct alteration of approved time.
- Manager-created ad-hoc timesheets for forgotten or unscheduled work.
- Location/kiosk/PIN support and optional geofence/device evidence.

### Scheduling and compliance
- Availability/leave conflict warnings in the planner.
- Rest-period, maximum-hour, minor-worker and overtime warnings.
- Skills/certification requirements for roles.
- Forecast labour cost versus revenue and actual labour variance.

### Operations and communication
- Notification centre with read state and email/push delivery.
- Schedule publication acknowledgements and change notifications.
- Manager inbox for open-shift, swap, leave and timesheet exceptions.
- Multi-location filtering across all manager modules.

### Inventory and ordering
- Stock-count sessions with variance and audit history.
- Delivery receiving, partial delivery, substitutions and invoice matching.
- Product units/conversions, supplier catalogues and location-specific par levels.
- Waste, transfers between locations and theoretical-versus-actual stock.

### Security and SaaS readiness
- Persistent manager UI replacing local demo state.
- Fine-grained permissions for approve, edit, unapprove and export.
- Session/device management, password reset, MFA and rate limiting.
- Data retention, GDPR export/deletion workflows, backups and observability.
