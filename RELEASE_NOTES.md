# v0.19.0-rc.96 — Shared staff Operations link

## Baseline

- Continued from v0.19.0-rc.95. That release is the rollback checkpoint.

## Included

- Added an unguessable, organization-scoped shared staff link for the Operations employee surface.
- The no-login link provides Home, Handbook, Tasks and Needs, but intentionally limits tasks to the shared Everyone audience and excludes all owner/manager controls.
- Public task, checklist, needed-item and ordering changes are auditable as shared-link actions without being falsely assigned to an individual employee.

Apply `db/migrations/022_operation_public_staff_link.sql` before publishing a shared staff link.

Rollback checkpoint: **v0.19.0-rc.95**.
