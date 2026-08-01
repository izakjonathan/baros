# Bar Ops v0.8.5 — PostgreSQL Integrity and Transaction Completion

This release concentrates on the highest-risk PostgreSQL findings from the v0.8.4 audit.

## Database migration

Run `Database administration → migrate` after deployment. Migration `009_postgresql_integrity_completion.sql` adds tenant-integrity triggers, stock and price guards, recurrence linkage, one-open-break protection, receipt/transfer item uniqueness, and payroll-period overlap prevention.

## Atomic product and inventory writes

Product creation, location inventory creation, product editing, stock/par editing, supplier validation, and audit logging now run in one PostgreSQL transaction. Failed writes roll back completely.

## Complete stock posting

- Delivery receiving records receipt items, updates received purchase-order quantities, posts accepted stock, writes stock-ledger entries, and updates the purchase-order status.
- Waste locks inventory, rejects quantities above available stock, deducts inventory, and writes a ledger entry atomically.
- Transfers validate both locations and products, reject insufficient source stock, create transfer items, and write paired TRANSFER_OUT / TRANSFER_IN ledger entries.

## Concurrency-safe staff workflows

Open-shift claims lock both the request and shift before approval. Competing claims cannot assign the same shift twice. Handovers and swaps lock and revalidate all involved shifts before assignments are changed.

## Validation and migration integrity

Shared numeric, enum, and object-array validators were added. Critical inventory, receiving, transfer, waste, claim, and swap routes now reject malformed payloads. The migration runner records SHA-256 checksums; Verify detects missing or modified migration files.

## Validation

All bundled regression suites passed, including `test:postgresql-integrity`. A local dependency install/build could not be completed because the execution workspace npm mirror does not provide `@types/node`; GitHub Quality Checks remains the full public-registry build check.
