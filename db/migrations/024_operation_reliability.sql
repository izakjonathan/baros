-- Operation reliability and recoverability.
-- Idempotency keys prevent duplicate writes when mobile clients retry after a
-- connection interruption. Article archival keeps owner mistakes recoverable.

alter table operation_articles
  add column if not exists archived_at timestamptz,
  add column if not exists idempotency_key text;

create index if not exists operation_articles_active_idx
  on operation_articles(organization_id, kind, updated_at desc)
  where archived_at is null;

create unique index if not exists operation_articles_idempotency_uq
  on operation_articles(organization_id, idempotency_key)
  where idempotency_key is not null;

alter table operation_daily_tasks
  add column if not exists idempotency_key text;

create unique index if not exists operation_daily_tasks_idempotency_uq
  on operation_daily_tasks(organization_id, idempotency_key)
  where idempotency_key is not null;

alter table operation_needs
  add column if not exists idempotency_key text;

create unique index if not exists operation_needs_idempotency_uq
  on operation_needs(organization_id, idempotency_key)
  where idempotency_key is not null;

alter table operation_cash_counts
  add column if not exists idempotency_key text;

create unique index if not exists operation_cash_counts_idempotency_uq
  on operation_cash_counts(organization_id, idempotency_key)
  where idempotency_key is not null;

alter table operation_public_access
  add column if not exists expires_at timestamptz,
  add column if not exists rotated_at timestamptz;
