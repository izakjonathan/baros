-- Reminders keeps stock, product proposals, and practical issues in one simple staff flow.
alter table operation_needs
  add column if not exists reminder_type text not null default 'RESTOCK',
  add column if not exists stock_level text;

alter table operation_needs
  drop constraint if exists operation_needs_reminder_type_check,
  drop constraint if exists operation_needs_stock_level_check,
  add constraint operation_needs_reminder_type_check check (reminder_type in ('RESTOCK','NEW_ITEM','ISSUE')),
  add constraint operation_needs_stock_level_check check (stock_level is null or stock_level in ('LOW','OUT_OF'));

alter table operation_needs
  alter column status type text using status::text;

alter table operation_needs
  drop constraint if exists operation_needs_status_check,
  add constraint operation_needs_status_check check (status in ('NEEDED','ORDERED','RESOLVED','DISMISSED'));

update operation_needs
set reminder_type=case when priority='HIGH' then 'NEW_ITEM' else 'RESTOCK' end,
    stock_level=case when priority='LOW' then 'LOW' when priority='NORMAL' then 'OUT_OF' else null end
where reminder_type='RESTOCK' and stock_level is null;

create index if not exists operation_needs_reminders_idx
  on operation_needs(organization_id,location_id,status,reminder_type,created_at desc);
