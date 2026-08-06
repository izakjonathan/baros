# Bar Ops — Role and Capability Matrix

**Basis:** Static inspection of `v0.19.0-rc.1`  
**Important:** This matrix distinguishes **observed source behaviour** from **intended behaviour still requiring approval**.

## 1. Account roles

| Role | Current meaning |
|---|---|
| `OWNER` | Highest organization-level management role |
| `ADMIN` | Broad organization administration role |
| `MANAGER` | Operational management role |
| `SHIFT_MANAGER` | Operational shift-management role with partial manager API access |
| `EMPLOYEE` | Employee self-service role |

`BARTENDER` is a job/shift role, not an account role. A bartender normally authenticates as `EMPLOYEE`.

## 2. Workspace access observed in source

| Surface | Owner | Admin | Manager | Shift Manager | Employee |
|---|---:|---:|---:|---:|---:|
| Manager root shell | Yes | Yes | Yes | Yes | No |
| Today’s Operations | Yes | Yes | Yes | Yes | No |
| Shift Execution | Yes | Yes | Yes | Yes | No |
| Shift Plan | Yes | Yes | Yes | Yes | No |
| Time & Attendance | Yes | Yes | Yes | Yes | No |
| Inventory | Yes | Yes | Yes | Yes | No |
| Purchase Orders | Yes | Yes | Yes | Yes | No |
| Daily Operations | Yes | Yes | Yes | Yes | No |
| Team | Yes | Yes | Yes | Yes in navigation | No |
| Requests review | Yes | Yes | Yes | Yes in navigation | No |
| Settings | Yes | Yes | Yes | Yes in navigation | No |
| Control Centre | Yes | Yes | Yes | Yes | No |
| Employee portal | Source permits authenticated access | Source permits authenticated access | Source permits authenticated access | Source permits authenticated access | Yes |

The manager page requires one of `OWNER`, `ADMIN`, `MANAGER`, or `SHIFT_MANAGER`.

The employee layout uses general authenticated access rather than an employee-only role list. Pages handle missing `employeeId` in different ways. The intended policy is unresolved.

## 3. Server capabilities observed

The table below records representative source evidence. It is not a substitute for executable authorization tests.

| Capability | Owner | Admin | Manager | Shift Manager | Employee | Evidence summary |
|---|---:|---:|---:|---:|---:|---|
| Read manager bootstrap | Yes | Yes | Yes | Yes | No | Manager bootstrap route |
| Publish schedule | Yes | Yes | Yes | Yes | No | Schedule publish route |
| Read schedule acknowledgements | Yes | Yes | Yes | Yes | Own/employee routes | Acknowledgement routes |
| Manage live time clock | Yes | Yes | Yes | Yes | Own clock actions | Time-clock routes |
| Read attendance alerts | Yes | Yes | Yes | Yes | No | Attendance alerts |
| Read timesheets | Yes | Yes | Yes | Yes | Own records | Timesheets GET |
| Change timesheet status | Yes | Yes | Yes | Yes | No | Timesheets mutation |
| Read payroll periods | Yes | Yes | Yes | Yes | No | Payroll periods GET |
| Lock/change payroll period | Yes | Yes | Yes | No | No | Payroll periods mutation |
| Read payroll export ledger | Yes | Yes | Yes | Yes | No | Payroll exports GET |
| Create payroll export | Yes | Yes | Yes | No | No | Payroll exports POST |
| Read schedule templates | Yes | Yes | Yes | Yes | No | Templates GET |
| Mutate schedule templates | Yes | Yes | Yes | No | No | Templates mutation |
| Employee invitation actions | Yes | Yes | Yes | No | No | Invitation routes use manager-only role set |
| Security administration | Yes | Yes | No | No | No | Security route |
| Employee self-service requests | Depends on linked employee record | Depends on linked employee record | Depends on linked employee record | Depends on linked employee record | Yes | Employee routes generally require authenticated user plus employee ID |
| Notification access | Own user notifications | Own user notifications | Own user notifications | Own user notifications | Own user notifications | Notifications query is user-scoped |

## 4. Confirmed inconsistency

The manager UI currently provides substantially the same navigation to all four management roles, while several server mutations intentionally exclude `SHIFT_MANAGER`.

This means server-side security remains in place, but UI capability presentation can be misleading.

Affected areas include at least:

- employee invitation and employee management actions;
- payroll locking;
- payroll export creation;
- schedule-template mutation;
- settings mutation;
- security administration.

## 5. Approved product decisions

### Decision R-01 — Shift Manager scope

`SHIFT_MANAGER` is an **operational shift lead**.

Shift Manager should be able to:

- see Today’s Operations;
- use Shift Execution;
- view and adjust the active schedule within approved limits;
- manage clock state and attendance exceptions;
- review operational requests;
- complete daily operations.

Shift Manager should not be able to:

- create employee accounts;
- invite, resend, revoke, or otherwise administer portal access;
- lock payroll periods;
- create payroll exports;
- change organization or security settings;
- change persistent schedule templates;
- perform organization-level governance actions.

The current API layer largely reflects this model. Phase B should bring navigation and action visibility into parity with it.

### Decision R-02 — Manager access to employee portal

Managers may intentionally use the employee portal when linked to an employee profile.

Required conditions:

- the manager must have a valid linked employee record;
- employee data remains scoped to that linked employee identity;
- manager privileges must not widen employee self-service data access;
- direct-route and API behaviour must be tested for all management roles.

### Decision R-03 — Owner versus Admin

`OWNER` and `ADMIN` remain equivalent in capability and governance scope.

Future capability rules should therefore treat them as equivalent unless the product owner explicitly changes this decision.

## 6. Required implementation rule

These decisions are approved. Phase B must:

1. create named capabilities rather than repeating role arrays;
2. retain server-side authorization as the source of enforcement;
3. use the capability map to hide or disable unavailable UI actions;
4. test direct URL and direct API access;
5. test one real account per role;
6. do not treat hidden UI as authorization.

## 7. Proposed capability names

These are documentation proposals, not implemented code:

- `operations.read`
- `operations.manage`
- `schedule.read`
- `schedule.edit`
- `schedule.publish`
- `schedule.templates.manage`
- `attendance.read`
- `attendance.manage`
- `payroll.read`
- `payroll.lock`
- `payroll.export`
- `requests.review`
- `inventory.read`
- `inventory.adjust`
- `orders.manage`
- `team.read`
- `team.manage`
- `accounts.invite`
- `settings.read`
- `settings.manage`
- `security.manage`
- `employee.self_service`

The final list should follow actual server operations rather than generic CRUD naming.
