alter table employees
  add column if not exists updated_at timestamptz not null default now();

update employees
set updated_at = coalesce(updated_at, created_at, now());

comment on column employees.updated_at is 'Last time the employee profile or linked portal account was updated.';
