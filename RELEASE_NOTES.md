# v0.8.7 — Published shift persistence

Fixes published shifts returning to Draft after refresh. The manager publish action now calls the transactional PostgreSQL schedule publication API and waits for confirmation before updating the visible schedule. It sends the selected location and exact week range, displays a publishing state, preserves drafts on failure, and uses an idempotency key. No database migration is required.
