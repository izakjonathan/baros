# Implementation status — v0.10.5

## PostgreSQL-backed and server-confirmed

- Employee profiles, invitations and activation
- Shift creation, recurrence, assignment, movement, publication and employee visibility
- Location context
- Employee availability, leave and exchange foundations
- Clock actions, timesheets, corrections, approval and payroll-export safeguards
- Products, location inventory, stock adjustments, receipt, waste and transfer foundations
- Time-clock settings, sessions, audit records and database verification

## Staged or partial workflows

- Daily Operations tasks and logbook still use browser workspace state.
- Purchase-order creation is not yet a complete line-item editor.
- Some dashboard summaries remain illustrative rather than authoritative database reports.
- The regression suite is broad, but most checks are source assertions rather than disposable-PostgreSQL and browser end-to-end tests.

## Engineering rules

A mutation must not report success before PostgreSQL confirms it. New work must use immutable UUIDs, selected-location context, tenant-scoped validation, transactional multi-table writes and explicit loading/error states.

## Release integrity

GitHub database and quality workflows are included. A dependency lockfile is not included because the build workspace cannot reliably access the public npm registry; workflows therefore continue to use `npm install`.
