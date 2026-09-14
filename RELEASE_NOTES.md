# v0.19.0-rc.85 — Task visibility and assignment

## Baseline

- Continued from v0.19.0-rc.84. That release is the rollback checkpoint.

## Included

- Fixed task creation with an empty optional instruction.
- Added explicit task audiences: Specific employee, Everyone on shift, and Everyone.
- Everyone on shift uses the published rota for the task’s service date; it never requires clocking in. Everyone is independent of the Shift module.
- Migration `019_operation_task_assignment_scope.sql` persists the audience safely.

Rollback checkpoint: **v0.19.0-rc.84**.
