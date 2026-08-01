-- Employee portal activation reliability hardening.
-- The application performs tenant authorization itself; invitations must be accessible
-- to the server connection used by Vercel, including when pooled and direct URLs use
-- different database roles.
alter table employees add column if not exists updated_at timestamptz not null default now();
alter table employee_invitations add column if not exists updated_at timestamptz not null default now();

alter table employee_invitations disable row level security;

create index if not exists employee_invitations_token_status_idx
  on employee_invitations(token_hash, status, expires_at);
