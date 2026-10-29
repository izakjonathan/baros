-- A deletion exception hides one bar-day occurrence without changing the series
-- or its completion history.
create table if not exists operation_task_exceptions (
  task_id uuid not null references operation_daily_tasks(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  service_date date not null,
  deleted_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (task_id, service_date)
);
