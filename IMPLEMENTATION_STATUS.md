# Implementation status — v0.8.5

## Implemented

- Tenant-integrity database triggers for core scheduling, ordering, stock, receiving, waste, and transfer relationships.
- Atomic product and location-inventory create/update workflows.
- Complete delivery receipt item posting and inventory ledger updates.
- Negative-stock prevention for waste and transfers.
- Transfer item persistence and paired source/destination ledger entries.
- Row-locked open-shift claim approval.
- Row-locked handover and swap approval with assignment revalidation.
- Migration SHA-256 recording and verification.
- Payroll-period overlap guard and one-open-break constraint.

## Still staged

- Live disposable-PostgreSQL integration tests in CI.
- Full validation conversion for every legacy mutation route.
- A multi-stage transfer lifecycle editor for DRAFT → IN_TRANSIT → RECEIVED transitions.
- Partial receipt correction/reversal UI and inventory reversal documents.
- Formal accounting period close for stock transactions.
- Full composite foreign keys on every tenant-owned table; v0.8.5 uses triggers for the highest-risk relationships.
- Dependency lockfile. Generation was attempted but blocked by the execution workspace npm mirror; GitHub can generate and commit it from the public npm registry.
