-- Payroll period integrity and employee timesheet correction requests.
create table if not exists payroll_periods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid references locations(id) on delete cascade,
  starts_on date not null,
  ends_on date not null,
  status text not null default 'OPEN' check (status in ('OPEN','LOCKED','EXPORTED')),
  locked_by uuid references users(id) on delete set null,
  locked_at timestamptz,
  exported_by uuid references users(id) on delete set null,
  exported_at timestamptz,
  export_file_name text,
  export_sha256 text,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  unique (organization_id, location_id, starts_on, ends_on)
);
create index if not exists payroll_periods_org_dates_idx on payroll_periods(organization_id, starts_on desc, ends_on desc);

create table if not exists timesheet_correction_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  timesheet_id uuid not null references timesheets(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  reason text not null,
  status text not null default 'PENDING' check (status in ('PENDING','ACCEPTED','REJECTED','CANCELLED')),
  reviewed_by uuid references users(id) on delete set null,
  reviewed_at timestamptz,
  manager_note text,
  created_at timestamptz not null default now()
);
create index if not exists timesheet_corrections_review_idx on timesheet_correction_requests(organization_id,status,created_at desc);
