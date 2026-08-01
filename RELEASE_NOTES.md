# Bar Ops v0.8.2 — Persistent shift synchronization

## Fixed

- New shifts no longer disappear when switching between manager modules.
- Production workspace now waits for the initial PostgreSQL bootstrap before allowing edits.
- Shift creation waits for the database response and stores the real PostgreSQL shift IDs.
- Shift editing uses the rows returned by PostgreSQL rather than optimistic temporary state.
- Shift deletion only removes the visible record after PostgreSQL confirms deletion.
- Failed shift writes keep the dialog/record intact and show the server error.

## Database

No migration is required.

## Test

`npm run test:shift-persistence` protects the synchronization workflow.
