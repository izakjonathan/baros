# Bar Ops v0.11.4 — Monthly Availability Type Fix

Built from v0.11.3.

## Fixed

- Narrows validated monthly availability dates to a concrete string before SQL insertion.
- Normalizes optional availability times and notes to `null` rather than allowing `undefined` to reach the PostgreSQL tagged-template client.
- Clears time values for dates marked unavailable.
- Preserves the existing monthly availability behavior and schema.

## Database

No migration is included or required.
