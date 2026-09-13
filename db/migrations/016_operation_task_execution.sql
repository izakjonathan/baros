-- Operation tasks are reusable schedules. Completion stays date-specific in
-- operation_daily_task_completions, so a recurring task retains its history.
alter table operation_daily_tasks
  add column if not exists task_type text not null default 'SERVICE' check (task_type in ('OPENING','SERVICE','CLOSING','MAINTENANCE','ADMIN')),
  add column if not exists priority text not null default 'NORMAL' check (priority in ('LOW','NORMAL','HIGH')),
  add column if not exists due_time time,
  add column if not exists reminder_minutes smallint check (reminder_minutes between 0 and 10080),
  add column if not exists assigned_employee_id uuid references employees(id) on delete set null;

create index if not exists operation_daily_tasks_execution_idx
  on operation_daily_tasks(organization_id, location_id, active, task_type, priority, due_time, sort_order);
