# v0.6.0 implementation status

## Implemented end-to-end foundations

- Tenant-scoped PostgreSQL bootstrap for manager employees, shifts, products, orders, timesheets, alerts, templates, forecasts and exports.
- Persistent employee create/update including payroll ID, salary code and cost centre.
- Persistent shift create/update/delete, recurrence scope API, open shifts, overlap/availability/leave checks.
- Persistent product creation and inventory update API.
- Persistent purchase-order creation API.
- Permanent payroll periods and immutable export ledger with included timesheet IDs and SHA-256 hashes.
- Closed payroll-period state and guarded state transitions.
- Kiosk PIN verification, failed-attempt lockout and geofence validation endpoint.
- Attendance alert store and manager resolution endpoint.
- Schedule templates, publication versions, notifications and acknowledgement schema.
- Delivery receipt, invoice discrepancy, waste and stock transfer ledgers.
- Password reset token, rate-limit, session, GDPR request and health-event foundations.
- Drag-and-drop schedule interaction in the manager calendar.

## Infrastructure-dependent or staged

These require external services or a later dedicated UI before they are production-complete:

- TOTP enrollment/QR/recovery-code user interface and encrypted secrets provider.
- Transactional email delivery for password resets and schedule notifications.
- Push notifications and mobile device registration.
- Scheduled attendance-alert worker for missed clock-outs and lateness.
- Managed PostgreSQL backup policy, point-in-time recovery and automated restore drills.
- External monitoring provider integration and alert routing.
- Full visual editors for templates, labour forecasts, delivery line matching and stock transfers.
- Browser geolocation permission UX and venue coordinate configuration screen.

The database schema and API boundaries are included now so these integrations can be added without another data-model rewrite.
