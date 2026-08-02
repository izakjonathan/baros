# Implementation status — v0.11.4

## Production-backed manager modules

Scheduling, employees, invitations, attendance, payroll, products, inventory transactions, settings and Daily Operations are backed by PostgreSQL.

Daily Operations now includes persistent location-scoped tasks and permanent manager logbook entries. Create, complete and delete operations are audited.

## Testing

The source regression suite runs on every quality build. GitHub Actions also provisions disposable PostgreSQL 17, applies all migrations and runs behavioral integration checks. Playwright mobile and iPad smoke tests remain available through `npm run test:e2e` but are not yet part of the default workflow.

## Remaining major staged area

Purchase-order creation remains an initial supplier-selection flow. Receiving, waste and stock-transfer posting are PostgreSQL-backed, but the complete line-item order editor is planned for a later release.
