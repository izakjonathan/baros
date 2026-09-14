-- RC84 removes the governance/reminder/audit structures that never reached a
-- user-facing workflow. Keep the operational records that are actually used.
drop table if exists operation_task_reminders;
drop table if exists operation_article_acknowledgements;
drop table if exists operation_article_versions;
drop table if exists operation_need_events;

alter table operation_articles
  drop column if exists version,
  drop column if exists review_due_date,
  drop column if exists last_published_at;
