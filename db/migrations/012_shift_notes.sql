create table if not exists shift_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  shift_id uuid not null references shifts(id) on delete cascade,
  employee_id uuid references employees(id) on delete set null,
  author_user_id uuid references users(id) on delete set null,
  note text not null,
  category text not null default 'NOTE',
  created_at timestamptz not null default now(),
  check (char_length(note) between 1 and 2000),
  check (category in ('NOTE','INCIDENT','EQUIPMENT','STOCK'))
);
create index if not exists shift_notes_shift_created_idx on shift_notes(shift_id,created_at desc);
create index if not exists shift_notes_org_location_created_idx on shift_notes(organization_id,location_id,created_at desc);
