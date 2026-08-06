# Bar Ops v0.19.0-rc.2 — Phase B1 Permission Capability Alignment

This release implements the first approved Phase B remediation slice.

## Approved product rules

- `SHIFT_MANAGER` is an operational shift lead.
- Managers may use the employee portal when linked to an employee profile.
- `OWNER` and `ADMIN` remain equivalent.

## Implemented

- one typed capability registry;
- one server helper for capability-based route authorization;
- capability-filtered manager navigation and workspace search;
- read-only Team presentation for Shift Managers;
- payroll lock and export controls hidden when the role lacks those capabilities;
- explicit employee-portal capability at the route layout;
- centralized authorization for employee records, invitations, payroll periods, payroll exports, schedule templates, and time-clock settings;
- Phase A documentation included under `docs/constitution/`;
- focused source regression for role and API parity.

## Deliberately not included

- broad API migration to capabilities;
- architectural decomposition;
- CSS cleanup;
- database schema changes;
- concurrency changes without runtime evidence;
- production sign-off.

## Verification still required

- one authenticated account per role;
- direct API tests;
- linked and unlinked manager employee-portal tests;
- live PostgreSQL tenant tests;
- staging browser and device acceptance.
