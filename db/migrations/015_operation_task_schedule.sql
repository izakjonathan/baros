alter table operation_daily_tasks
  add column due_date date,
  add column repeat_unit text not null default 'WEEK' check (repeat_unit in ('NONE','DAY','WEEK','MONTH','YEAR')),
  add column repeat_interval smallint not null default 1 check (repeat_interval between 1 and 365),
  add column repeat_end_date date;

update operation_daily_tasks
set due_date = current_date - ((extract(dow from current_date)::integer - weekday + 7) % 7)
where due_date is null;

alter table operation_daily_tasks alter column due_date set not null;

create index operation_daily_tasks_schedule_idx
  on operation_daily_tasks(organization_id, location_id, due_date, repeat_unit, active);
