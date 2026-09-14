-- Remaining Operation product layer: reusable task templates, subtasks,
-- handbook governance, procurement detail, audit-safe histories and reminders.
alter table operation_daily_tasks
  add column if not exists checklist jsonb not null default '[]'::jsonb;

create table if not exists operation_task_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid references locations(id) on delete cascade,
  title text not null,
  description text not null default '',
  task_type text not null default 'SERVICE' check (task_type in ('OPENING','SERVICE','CLOSING','MAINTENANCE','ADMIN')),
  priority text not null default 'NORMAL' check (priority in ('LOW','NORMAL','HIGH')),
  due_time time,
  reminder_minutes smallint check (reminder_minutes between 0 and 10080),
  checklist jsonb not null default '[]'::jsonb,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists operation_task_templates_scope_idx on operation_task_templates(organization_id,location_id,task_type,title);

create table if not exists operation_task_checklist_completions (
  task_id uuid not null references operation_daily_tasks(id) on delete cascade,
  service_date date not null,
  item_id text not null,
  organization_id uuid not null references organizations(id) on delete cascade,
  completed_by uuid references users(id) on delete set null,
  completed_at timestamptz not null default now(),
  primary key(task_id,service_date,item_id)
);

alter table operation_needs
  add column if not exists quantity numeric(10,2),
  add column if not exists unit text,
  add column if not exists supplier text,
  add column if not exists priority text not null default 'NORMAL' check (priority in ('LOW','NORMAL','HIGH')),
  add column if not exists needed_by date,
  add column if not exists updated_by uuid references users(id) on delete set null;
create index if not exists operation_needs_planning_idx on operation_needs(organization_id,location_id,status,priority,needed_by);

create table if not exists operation_need_events (
  id uuid primary key default gen_random_uuid(),
  need_id uuid not null references operation_needs(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  actor_user_id uuid references users(id) on delete set null,
  event_type text not null check (event_type in ('CREATED','UPDATED','ORDERED','REOPENED')),
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists operation_need_events_history_idx on operation_need_events(need_id,created_at desc);

alter table operation_articles
  add column if not exists version integer not null default 1,
  add column if not exists review_due_date date,
  add column if not exists last_published_at timestamptz;

create table if not exists operation_article_versions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references operation_articles(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(article_id,version)
);
create index if not exists operation_article_versions_history_idx on operation_article_versions(article_id,version desc);

create table if not exists operation_article_acknowledgements (
  article_id uuid not null references operation_articles(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  version integer not null,
  acknowledged_at timestamptz not null default now(),
  primary key(article_id,user_id,version)
);

create table if not exists operation_task_reminders (
  task_id uuid not null references operation_daily_tasks(id) on delete cascade,
  service_date date not null,
  organization_id uuid not null references organizations(id) on delete cascade,
  reminder_at timestamptz not null,
  notified_at timestamptz,
  primary key(task_id,service_date)
);
