# Bar Ops v0.19.0-rc.3 — Authorization and Data-Integrity Verification

## Scope

This release aligns remaining management API guards with the centralized capability model and adds source and live-database verification tools.

It does not claim that authenticated multi-role, concurrent-write, or tenant-negative tests have run in this environment.

## Source-verified rules

- Owner and Admin use the same capability set.
- Shift Manager remains an operational shift lead.
- Management APIs use named capabilities rather than repeated role arrays.
- Employee portal access remains available to authenticated roles with `employee.self_service`.
- Employee self-service data remains dependent on the linked `employeeId` loaded from the authenticated session.
- Shift Manager cannot manage employee accounts, invitations, payroll locks, payroll exports, persistent schedule templates, settings mutations, or security administration.

## API capability alignment

| API area | Read capability | Mutation capability |
|---|---|---|
| Manager bootstrap | `manager.workspace` | — |
| Attendance alerts | `attendance.read` | `attendance.manage` |
| Managed breaks | — | `attendance.manage` |
| Timesheet correction/status | Employee/manager scoped read | `attendance.manage` |
| Approved-hours CSV | — | `payroll.export` |
| Payroll periods | `payroll.read` | `payroll.manage` |
| Payroll export ledger | `payroll.read` | `payroll.export` |
| Schedule publication | — | `schedule.publish` |
| Schedule templates | `schedule.read` | `schedule.templates.manage` |
| Schedule acknowledgements | `schedule.read` | `schedule.publish` for reminders |
| Operations ledger | `operations.read` | `operations.manage` |
| Operation checklists | `operations.read` | `operations.manage` |
| Employee invitations | — | `accounts.invite` |
| Time-clock settings | `settings.read` | `settings.manage` |
| Security administration | — | `security.manage` |

## Live database command

```bash
npm run verify:authorization-integrity
```

The command requires `DATABASE_DIRECT_URL` or `DATABASE_URL` and verifies:

- every migration is applied with the expected checksum;
- tenant guard triggers are installed;
- audit-log actor, state, and timestamp columns exist;
- no cross-tenant employee/location, shift, or timesheet relationships exist;
- payroll periods do not overlap within the same organization/location scope;
- no timesheet has multiple open breaks.

## Runtime verification still required

Use one authenticated account for each role and verify direct UI and direct API access. Use at least two organizations and attempt cross-tenant identifiers. Run concurrent requests for shifts, timesheets, stock adjustments, and order receiving.

These checks require a staging database and are not marked complete by the source regression.
