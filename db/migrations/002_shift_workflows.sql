create type shift_claim_status as enum ('PENDING','APPROVED','REJECTED','CANCELLED');
create type shift_transfer_type as enum ('HANDOVER','SWAP');
create type shift_transfer_status as enum ('PENDING_EMPLOYEE','PENDING_MANAGER','APPROVED','REJECTED','CANCELLED');

alter table shifts add column recurrence_group_id uuid;
alter table shifts add column is_open boolean not null default false;
alter table shifts add column claimed_by_employee_id uuid references employees(id) on delete set null;
create index shifts_recurrence_idx on shifts(recurrence_group_id);
create index shifts_open_idx on shifts(organization_id,location_id,is_open,starts_at) where is_open = true;

create table shift_recurrence_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  frequency text not null check (frequency in ('DAILY','WEEKLY')),
  interval_count integer not null default 1 check (interval_count > 0),
  weekdays smallint[] not null default '{}',
  starts_on date not null,
  ends_on date,
  occurrence_count integer,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table shift_claims (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  shift_id uuid not null references shifts(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  status shift_claim_status not null default 'PENDING',
  note text,
  reviewed_by uuid references users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(shift_id,employee_id)
);
create index shift_claims_review_idx on shift_claims(organization_id,status,created_at desc);

create table shift_transfers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  shift_id uuid not null references shifts(id) on delete cascade,
  requested_by_employee_id uuid not null references employees(id) on delete cascade,
  target_employee_id uuid references employees(id) on delete set null,
  swap_shift_id uuid references shifts(id) on delete set null,
  type shift_transfer_type not null,
  status shift_transfer_status not null default 'PENDING_EMPLOYEE',
  note text,
  target_responded_at timestamptz,
  reviewed_by uuid references users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index shift_transfers_review_idx on shift_transfers(organization_id,status,created_at desc);
