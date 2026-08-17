# Bar Ops — Role and Capability Matrix

**Basis:** `v0.19.0-rc.56` candidate source

**Policy owner:** `lib/auth/capabilities.ts`

**Status:** Implemented and regression-tested

## 1. Account roles

| Role | Meaning |
|---|---|
| `OWNER` | Full organization governance and operations |
| `ADMIN` | Same capability tier as Owner |
| `MANAGER` | Full operational and administration access except security administration |
| `SHIFT_MANAGER` | Operational shift lead without organization-level account, payroll, template, settings, or security administration |
| `EMPLOYEE` | Employee self-service only |

`BARTENDER` and similar labels are employment or shift-assignment roles, not authenticated account roles.

## 2. Implemented capability table

| Capability | Owner | Admin | Manager | Shift Manager | Employee |
|---|---:|---:|---:|---:|---:|
| `manager.workspace` | Yes | Yes | Yes | Yes | No |
| `operations.read` | Yes | Yes | Yes | Yes | No |
| `operations.manage` | Yes | Yes | Yes | Yes | No |
| `schedule.read` | Yes | Yes | Yes | Yes | No |
| `schedule.edit` | Yes | Yes | Yes | Yes | No |
| `schedule.publish` | Yes | Yes | Yes | Yes | No |
| `schedule.templates.manage` | Yes | Yes | Yes | No | No |
| `attendance.read` | Yes | Yes | Yes | Yes | No |
| `attendance.manage` | Yes | Yes | Yes | Yes | No |
| `payroll.read` | Yes | Yes | Yes | Yes | No |
| `payroll.manage` | Yes | Yes | Yes | No | No |
| `payroll.export` | Yes | Yes | Yes | No | No |
| `requests.review` | Yes | Yes | Yes | Yes | No |
| `inventory.read` | Yes | Yes | Yes | Yes | No |
| `inventory.adjust` | Yes | Yes | Yes | Yes | No |
| `orders.manage` | Yes | Yes | Yes | Yes | No |
| `team.read` | Yes | Yes | Yes | Yes | No |
| `team.manage` | Yes | Yes | Yes | No | No |
| `accounts.invite` | Yes | Yes | Yes | No | No |
| `settings.read` | Yes | Yes | Yes | Yes | No |
| `settings.manage` | Yes | Yes | Yes | No | No |
| `security.manage` | Yes | Yes | No | No | No |
| `control.read` | Yes | Yes | Yes | Yes | No |
| `employee.self_service` | Yes | Yes | Yes | Yes | Yes |

The authentication contract executes all 120 role/capability cells and verifies `rolesWithCapability` returns the same policy in reverse.

## 3. Enforcement rules

- Server-side capability checks are authoritative; hidden or disabled UI is not authorization.
- Manager navigation and action visibility use the same capability owner as route enforcement.
- Direct Orders access requires `orders.manage` for both reads and creation.
- Product reads require `inventory.read`; product and stock mutations require `inventory.adjust`.
- Request, shift-claim, and shift-transfer review requires `requests.review`.
- Shift reads require `schedule.read`; shift mutations and manager-authored notes require `schedule.edit`.
- Organization-wide timesheet reads require `attendance.read`; corrections continue to require `attendance.manage`.
- Audit-log reads require `control.read`; Settings writes require `settings.manage`.
- Request and attendance-review notification audiences are derived from the corresponding review/manage capability.

## 4. Employee self-service

Every authenticated role may use the employee portal only when that account is linked to an active employee record. Self-service operations remain scoped to that linked employee identity and do not inherit broader manager data access.

Request and shift-claim submission require both `employee.self_service` and a linked employee record. An employee transfer response is selected by the explicit `accept` operation, then checked against the target employee ID; manager review is a separate path requiring `requests.review`.

## 5. Intentional direct-role decisions

Explicit role values remain valid where the role itself is data rather than an authorization shortcut, including:

- choosing the post-login manager or employee destination;
- resolving development-session identity;
- validating the finite development role enum;
- preventing employee invitations from overwriting an existing management membership;
- persisting an activated invitation as an `EMPLOYEE` membership.

These identity and account-lifecycle decisions must not be generalized into capabilities unless their product semantics change.

## 6. Approved product decisions

1. `SHIFT_MANAGER` is an operational shift lead, not a full location administrator.
2. Managers may use employee self-service when linked to an employee profile.
3. `OWNER` and `ADMIN` remain equivalent in capability and governance scope.

Any policy change must update `lib/auth/capabilities.ts`, this matrix, the 120-cell test table, affected direct-route contracts, and the release notes together.
