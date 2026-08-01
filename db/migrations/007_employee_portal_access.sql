create type employee_invitation_status as enum ('PENDING','ACCEPTED','REVOKED','EXPIRED');

create table employee_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  email citext not null,
  token_hash text not null unique,
  status employee_invitation_status not null default 'PENDING',
  expires_at timestamptz not null,
  invited_by uuid references users(id) on delete set null,
  accepted_by uuid references users(id) on delete set null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index employee_invitations_employee_idx on employee_invitations(employee_id, created_at desc);
create unique index employee_invitations_one_pending_idx on employee_invitations(employee_id) where status='PENDING';

alter table employee_invitations enable row level security;

comment on table employee_invitations is 'Single-use employee portal invitations. Only SHA-256 token digests are stored.';
