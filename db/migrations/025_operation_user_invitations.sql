-- Operation-only account invitations.
-- The public staff link remains the default employee access route, while an
-- owner can optionally invite an individual Owner, Manager, or Employee login.

create table if not exists operation_user_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  email citext not null,
  name text not null,
  role membership_role not null,
  token_hash text not null unique,
  status employee_invitation_status not null default 'PENDING',
  expires_at timestamptz not null,
  invited_by uuid references users(id) on delete set null,
  accepted_by uuid references users(id) on delete set null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint operation_user_invitation_role_check
    check (role in ('OWNER', 'MANAGER', 'EMPLOYEE'))
);

create index if not exists operation_user_invitations_org_created_idx
  on operation_user_invitations(organization_id, created_at desc);

create unique index if not exists operation_user_invitations_one_pending_email_idx
  on operation_user_invitations(organization_id, lower(email::text))
  where status = 'PENDING';

alter table operation_user_invitations enable row level security;

comment on table operation_user_invitations is
  'Single-use Operation account invitations. Only SHA-256 token digests are stored.';
