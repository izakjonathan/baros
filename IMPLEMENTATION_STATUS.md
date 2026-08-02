# Implementation status — v0.9.1

## Persistent and server-confirmed
Employee profiles and invitations, shifts and publications, products and location inventory, payroll/timesheet APIs, employee clock actions, settings, stock receipt/waste/transfer APIs, and audit records.

## Development-local or partially integrated
Daily operations editor, complete purchase-order editor, some dashboard summary cards, and some manager approval surfaces still use presentation state or incomplete UI flows. They are not represented as completed production workflows.

## Operational rule
A manager action must not show success before its PostgreSQL request succeeds. New work should use UUIDs, selected location context, tenant-scoped queries, shared validation helpers, and a transaction for multi-table writes.


## v0.9.9 release integrity
- GitHub database and quality workflows are restored.
- Mono is split into tokens and component primitives with no `!important` declarations in the Mono layer.
- A dependency lockfile is still not included because the release workspace could not reach the public npm registry reliably. GitHub currently uses `npm install`; generate and commit `package-lock.json` from a successful public-registry install before changing workflows to `npm ci`.
