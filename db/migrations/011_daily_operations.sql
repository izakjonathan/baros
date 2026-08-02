-- Persistent Daily Operations tasks and manager logbook entries.
create table if not exists operational_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 240),
  task_type text not null default 'Task' check (task_type in ('Opening','Closing','Task','Maintenance')),
  owner_label text not null default 'Unassigned',
  due_label text not null default 'Today',
  note text,
  done boolean not null default false,
  completed_at timestamptz,
  completed_by uuid references users(id) on delete set null,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists operational_tasks_location_state_idx on operational_tasks(location_id, done, created_at desc);

create table if not exists manager_log_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  title text not null default 'Shift handover' check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 4000),
  author_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists manager_log_entries_location_created_idx on manager_log_entries(location_id, created_at desc);

create or replace function enforce_daily_operations_tenant() returns trigger language plpgsql as $$
begin
  if not exists (select 1 from locations l where l.id = new.location_id and l.organization_id = new.organization_id) then
    raise exception 'Daily Operations location does not belong to organization';
  end if;
  return new;
end $$;

drop trigger if exists tenant_guard_operational_tasks on operational_tasks;
create trigger tenant_guard_operational_tasks before insert or update on operational_tasks for each row execute function enforce_daily_operations_tenant();
drop trigger if exists tenant_guard_manager_log_entries on manager_log_entries;
create trigger tenant_guard_manager_log_entries before insert or update on manager_log_entries for each row execute function enforce_daily_operations_tenant();
