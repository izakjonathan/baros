create type operation_article_kind as enum ('HANDBOOK','NEWS');
create type operation_need_status as enum ('NEEDED','ORDERED');

create table operation_articles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  kind operation_article_kind not null,
  category text not null,
  title text not null,
  description text not null,
  content jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index operation_articles_org_kind_idx on operation_articles(organization_id, kind, category, sort_order, updated_at desc);

create table operation_daily_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid references locations(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  title text not null,
  description text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index operation_daily_tasks_day_idx on operation_daily_tasks(organization_id, location_id, weekday, active, sort_order);

create table operation_daily_task_completions (
  task_id uuid not null references operation_daily_tasks(id) on delete cascade,
  service_date date not null,
  organization_id uuid not null references organizations(id) on delete cascade,
  completed_by uuid references users(id) on delete set null,
  completed_at timestamptz not null default now(),
  primary key (task_id, service_date)
);
create index operation_daily_task_completions_day_idx on operation_daily_task_completions(organization_id, service_date);

create table operation_needs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  title text not null,
  note text,
  status operation_need_status not null default 'NEEDED',
  created_by uuid references users(id) on delete set null,
  ordered_by uuid references users(id) on delete set null,
  ordered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index operation_needs_open_idx on operation_needs(organization_id, location_id, status, created_at desc);
