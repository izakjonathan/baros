# v0.19.0-rc.56 — Capability and Permission Parity

## Baseline

- Continued from the exact v0.19.0-rc.55 ZIP confirmed working by the user.
- Verified baseline archive: `bar-ops-v0.19.0-rc.55-runtime-source-surface-cleanup.zip`.
- Verified baseline SHA-256: `97d06c614bd4ac2bc29c24c7903c3cdefceda7a7f584e7a07696d06e398e7114`.
- v0.19.0-rc.55 remains the rollback checkpoint.

## Capability enforcement

- Orders now require `orders.manage` for direct reads and creation.
- Products require `inventory.read` for direct reads and `inventory.adjust` for mutations.
- Manager request, shift-claim, and shift-transfer review paths require `requests.review`; employee submission and owned history paths require `employee.self_service` and remain employee-scoped.
- Shift reads require `schedule.read`; shift mutations and manager-authored shift notes require `schedule.edit`.
- Timesheet-wide reads require `attendance.read`, while employee reads and correction requests remain linked-record scoped; correction management and correction-review notification recipients use `attendance.manage`.
- Audit access now requires `control.read` and Settings write controls use `settings.manage`.
- A linked manager can answer a transfer as the target employee when the request carries the employee-response operation; that does not grant manager-review permission.
- Request-review notification recipients are derived from `requests.review` instead of a duplicated management-role list.

## Regression protection

- The authentication contract executes the real capability module after TypeScript transpilation.
- A table-driven matrix verifies all 24 capabilities for all five roles: 120 explicit role/capability decisions.
- Source contracts verify each migrated API and UI surface uses its named capability and contains no employee-exclusion shortcut or management-role authorization array.

## Scope

No dependency, CSS, database migration/schema, visual layout, or unrelated business workflow changed. Authentication roles, public route paths, request/response shapes, tenant scoping, and the three-file CSS architecture remain unchanged.

Rollback checkpoint: **v0.19.0-rc.55**.
