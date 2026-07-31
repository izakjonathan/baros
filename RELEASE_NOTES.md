# Bar Ops v0.6.0 — Production operations foundation

This major release connects the manager workspace to a tenant-scoped PostgreSQL bootstrap and introduces production data models and APIs for payroll integrity, kiosk attendance, geofencing, alerts, schedule templates/publications, labour forecasts, delivery receiving, invoice matching, waste, stock transfers, security and GDPR.

## Highlights

- PostgreSQL manager workspace bootstrap and persistent CRUD foundations.
- Permanent payroll export history with file hashes and included timesheet IDs.
- Open, locked, exported and closed payroll periods.
- Employee payroll IDs, salary codes and cost centres.
- Kiosk PIN authentication with rate limiting and lockout.
- Venue geofence validation.
- Attendance alerts and correction-request foundation.
- Drag-and-drop schedule movement.
- Recurrence scope updates and availability/leave/overlap checks.
- Schedule templates, versioned publication, notifications and acknowledgements.
- Labour forecast records.
- Goods receipts, invoice discrepancy tracking, waste ledger and stock transfers.
- MFA/password-reset/session/GDPR/health-event foundations.
- New Control centre module showing production capability status.

Run `npm run db:migrate` to apply `005_production_operations.sql`.
Run `npm run test:production` for the new production-foundation assertions.

See `IMPLEMENTATION_STATUS.md` for external-service and dedicated-UI work that remains staged rather than falsely represented as complete.
