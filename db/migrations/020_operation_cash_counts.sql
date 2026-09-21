-- A cash count is a factual entry, not a balance adjustment. Keep every
-- submission so several staff counts can be reviewed against one bar day.
create table if not exists operation_cash_counts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  operational_date date not null,
  till_amount numeric(12,2),
  change_box_amount numeric(12,2),
  counted_by_name text not null,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (till_amount is not null or change_box_amount is not null),
  check (till_amount is null or till_amount >= 0),
  check (change_box_amount is null or change_box_amount >= 0),
  check (char_length(counted_by_name) between 1 and 100)
);

create index if not exists operation_cash_counts_recent_idx
  on operation_cash_counts(organization_id, location_id, operational_date desc, created_at desc);
