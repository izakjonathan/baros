# v0.19.0-rc.84 — Operation integrity completion

## Baseline

- Continued from v0.19.0-rc.83. That release is the rollback checkpoint.

## Included

- Correct service-date persistence and authoritative mutation recovery.
- Shared role-capability handling for task management.
- Copenhagen date handling, safer image upload validation, and month-end recurrence.
- Migration `018_operation_integrity_cleanup.sql` removes unshipped reminder, governance, acknowledgement and audit-history tables.

Rollback checkpoint: **v0.19.0-rc.83**.
