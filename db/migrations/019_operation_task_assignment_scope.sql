-- Task audiences are explicit. “EVERYONE” intentionally does not consult the
-- scheduling or clock-in modules; “ON_SHIFT” is resolved from the published
-- rota on the service date; “EMPLOYEE” requires a linked employee record.
alter table operation_daily_tasks
  add column if not exists assignment_scope text not null default 'EVERYONE'
    check (assignment_scope in ('EMPLOYEE','ON_SHIFT','EVERYONE'));

update operation_daily_tasks
set assignment_scope = 'EMPLOYEE'
where assignment_scope = 'EVERYONE' and assigned_employee_id is not null;

create index if not exists operation_daily_tasks_assignment_scope_idx
  on operation_daily_tasks(organization_id, location_id, assignment_scope, assigned_employee_id)
  where active=true;
