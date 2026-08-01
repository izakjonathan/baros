# Bar Ops v0.8.6 — Team scheduled-hours fix

- Team cards now calculate scheduled hours from the live PostgreSQL-backed shift state instead of displaying contracted hours.
- Published assigned shifts in the next 28 days are counted.
- Employee matching uses immutable employee UUIDs, with a name fallback only for legacy development data.
- Overnight shifts are calculated correctly.
- Added `npm run test:team-scheduled-hours`.
- No database migration is required.
