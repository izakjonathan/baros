create table if not exists operation_public_access (
  organization_id uuid primary key references organizations(id) on delete cascade,
  access_token uuid not null unique default gen_random_uuid(),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into operation_public_access (organization_id)
select id from organizations
on conflict (organization_id) do nothing;

create or replace function create_operation_public_access()
returns trigger language plpgsql as $$
begin
  insert into operation_public_access (organization_id) values (new.id)
  on conflict (organization_id) do nothing;
  return new;
end;
$$;

drop trigger if exists organizations_operation_public_access on organizations;
create trigger organizations_operation_public_access
after insert on organizations
for each row execute function create_operation_public_access();
