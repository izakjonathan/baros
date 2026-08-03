# Employee Self-Service Audit — v0.11.0

Baseline: v0.10.11 Employee Timesheet Rendering.

## Confirmed existing foundations

- Weekly availability editor persisted to `availability_rules`.
- Time-off request form and employee request history.
- Published employee schedule and open-shift discovery.
- Transactional open-shift claims with row locking.
- Employee-to-employee handover and swap acceptance.
- Transactional manager approval logic for claims and transfers.
- Per-user notification table and employee notification page.

## Gaps found before implementation

1. Managers had no visible review workspace for time off, open-shift claims, or accepted shift transfers.
2. The requests API had no manager decision endpoint.
3. Request creation and review did not consistently notify the next actor.
4. Open-shift and transfer decisions did not consistently notify employees.
5. Manager notification links did not open a relevant workspace because no requests workspace existed.
6. Several employee action buttons relied on implicit form-button behavior.
7. Request input validation was primarily client-side.

## v0.11.0 remediation

- Added a unified manager Requests workspace.
- Added transactional time-off request approval/rejection.
- Connected notifications across request, claim, transfer, colleague-response, and manager-review stages.
- Added server-side request type/date/note validation.
- Added explicit button types to employee self-service controls.
- Preserved existing database schema and workflow locking.

## Deliberately deferred

- Calendar visualization of availability.
- Partial-day leave policies and accrued leave balances.
- Automatic conflict warnings against approved leave.
- Push/email delivery; notifications remain in-app.
- Employee cancellation of pending requests.
- Bulk manager decisions.
