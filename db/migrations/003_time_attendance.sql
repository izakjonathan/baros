-- Time & attendance foundation: raw punch events, breaks and approvable timesheets.
create table if not exists time_clock_settings (
  location_id uuid primary key references locations(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  allow_mobile_clock boolean not null default true,
  allow_kiosk_clock boolean not null default true,
  allow_unscheduled_clock boolean not null default false,
  require_location_check boolean not null default false,
  early_clock_in_minutes integer not null default 15 check (early_clock_in_minutes between 0 and 240),
  late_clock_out_minutes integer not null default 60 check (late_clock_out_minutes between 0 and 720),
  rounding_minutes integer not null default 0 check (rounding_minutes in (0,5,6,10,15)),
  auto_approve_within_minutes integer,
  updated_at timestamptz not null default now()
);
create table if not exists timesheets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  shift_id uuid references shifts(id) on delete set null,
  work_date date not null,
  clocked_in_at timestamptz not null,
  clocked_out_at timestamptz,
  scheduled_minutes integer not null default 0,
  worked_minutes integer not null default 0,
  break_minutes integer not null default 0,
  status text not null default 'OPEN' check (status in ('OPEN','PENDING','APPROVED','REJECTED')),
  employee_note text,
  manager_note text,
  approved_by uuid references users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists one_open_timesheet_per_employee on timesheets(employee_id) where status='OPEN';
create index if not exists timesheets_org_date_idx on timesheets(organization_id, work_date desc);
create index if not exists timesheets_employee_date_idx on timesheets(employee_id, work_date desc);
create table if not exists time_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  timesheet_id uuid not null references timesheets(id) on delete cascade,
  event_type text not null check (event_type in ('CLOCK_IN','BREAK_START','BREAK_END','CLOCK_OUT','MANAGER_EDIT')),
  occurred_at timestamptz not null default now(),
  source text not null default 'WEB' check (source in ('WEB','MOBILE','KIOSK','MANAGER','POS_API')),
  latitude numeric(9,6), longitude numeric(9,6), accuracy_meters numeric(8,2),
  device_label text, note text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists time_events_timesheet_idx on time_events(timesheet_id, occurred_at);
create table if not exists time_breaks (
  id uuid primary key default gen_random_uuid(),
  timesheet_id uuid not null references timesheets(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  paid boolean not null default false,
  created_at timestamptz not null default now()
);
