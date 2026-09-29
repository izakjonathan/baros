alter table operation_daily_tasks
  add column if not exists images jsonb not null default '[]'::jsonb;

comment on column operation_daily_tasks.images is
  'Optimized task image metadata: preview/detail URLs, dimensions, and alt text.';
