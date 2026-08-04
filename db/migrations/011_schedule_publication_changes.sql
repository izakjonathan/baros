create table if not exists schedule_publication_shift_snapshots (
  publication_id uuid not null references schedule_publications(id) on delete cascade,
  shift_id uuid not null,
  employee_id uuid references employees(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  role text not null,
  primary key (publication_id, shift_id)
);

create index if not exists schedule_publication_shift_snapshots_employee_idx
  on schedule_publication_shift_snapshots(publication_id, employee_id);

create table if not exists schedule_publication_changes (
  publication_id uuid not null references schedule_publications(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  change_types text[] not null default '{}',
  primary key (publication_id, employee_id)
);
