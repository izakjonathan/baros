-- v0.7.1 security, tenant integrity, idempotency and payroll guards.
alter table payroll_periods add column if not exists work_date_range daterange generated always as (daterange(starts_on, ends_on, '[]')) stored;
create index if not exists payroll_periods_org_guard_idx on payroll_periods(organization_id,status);
create index if not exists payroll_periods_range_guard_idx on payroll_periods using gist (work_date_range);
create unique index if not exists payroll_exports_one_per_period_uq on payroll_exports(payroll_period_id);
alter table schedule_publications add column if not exists idempotency_key text;
create unique index if not exists schedule_publications_idempotency_uq on schedule_publications(organization_id,idempotency_key) where idempotency_key is not null;
create unique index if not exists schedule_publications_week_version_uq on schedule_publications(location_id,week_start,version);

-- Ensure common tenant-linked records cannot point to another organization's parent rows.
create unique index if not exists locations_org_id_uq on locations(organization_id,id);
create unique index if not exists employees_org_id_uq on employees(organization_id,id);
create unique index if not exists products_org_id_uq on products(organization_id,id);
create unique index if not exists shifts_org_id_uq on shifts(organization_id,id);

create or replace function prevent_locked_timesheet_mutation() returns trigger language plpgsql as $$
begin
  if exists (
    select 1 from payroll_periods p
    where p.organization_id = old.organization_id
      and (p.location_id is null or p.location_id = old.location_id)
      and old.work_date <@ p.work_date_range
      and p.status in ('LOCKED','EXPORTED','CLOSED')
  ) then
    raise exception 'Timesheet is protected by a locked payroll period' using errcode='55000';
  end if;
  return new;
end $$;
drop trigger if exists timesheets_locked_period_guard on timesheets;
create trigger timesheets_locked_period_guard before update or delete on timesheets for each row execute function prevent_locked_timesheet_mutation();
