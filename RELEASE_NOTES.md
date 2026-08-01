# Bar Ops v0.8.4 — Shift Assignment Display Fix

## Fixed

- Newly created assigned shifts now return the assigned employee's display name from PostgreSQL.
- Reassigned existing shifts now return the new employee's display name.
- The manager schedule no longer maps a successfully assigned shift to “Unassigned” merely because the raw insert/update response lacked the joined `employee_name` field.
- Employee organization and active-status validation is performed before both creation and reassignment.

## Deployment

This is a code-only release. No database migration is required.
