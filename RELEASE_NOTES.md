# Bar Ops v0.3.3 — Automatic Development Workspace

- Opens directly as Owner whenever `DATABASE_URL` is absent.
- Works on local development and Vercel previews without requiring `DEV_AUTH_ENABLED`.
- Adds a developer role switcher for Owner, Manager, Shift Manager and Employee.
- Role changes are stored in signed HTTP-only cookies and redirect to the appropriate workspace.
- Adding `DATABASE_URL` automatically restores normal PostgreSQL authentication unless `DEV_AUTH_ENABLED=true` is explicitly retained.
- The real database authentication implementation is unchanged.
