# Bar Ops v0.11.2 — PostgreSQL Integration & Daily Operations

## Daily Operations persistence

- Added migration `011_daily_operations.sql`.
- Opening, closing, maintenance and general operational tasks are stored per organization and location.
- Task completion and deletion are transactional and audited.
- Manager logbook entries are permanent PostgreSQL records with author and timestamp.
- Manager bootstrap loads tasks and logbook entries with the rest of the selected-location workspace.
- Development mode retains local persistence.

## Live PostgreSQL integration testing

- GitHub Quality Checks now starts a disposable PostgreSQL 17 service.
- All migrations are applied in sequence on every quality run.
- A behavioral integration suite verifies Daily Operations transactions, audit entries and cross-tenant guards.
- Integration tests use an isolated test organization and clean up their records.

## Deployment

Migration 011 is required. After deployment, run the Database administration workflow with `migrate`, followed by `verify`.
