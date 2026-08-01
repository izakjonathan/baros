# Bar Ops v0.7.6 — Postgres JSON value build fix

- Fixes TypeScript overload errors caused by passing postgres.js Row objects directly into tagged SQL templates.
- Serializes employee and shift audit payloads with JSON.stringify(... )::jsonb.
- Adds `npm run test:postgres-values` and includes it in `test:all`.
- No database migration is required.

# Bar Ops v0.7.5 — PostgreSQL transaction build fix

- Replaces unsupported `db().transaction(...)` calls with the correct postgres.js `db().begin(...)` API in employee activation, employee writes, invitation writes, and recurring shift writes.
- Adds `npm run test:postgres-api` to prevent unsupported transaction APIs from returning.
- Preserves all v0.7.4 functionality and requires no database migration.
