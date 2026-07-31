# Bar Ops v0.3.2 — Stable developer access

- Replaces the fragile client-only development login path with a server-handled HTML form flow.
- Adds one-click Owner, Manager and Shift Manager development sessions.
- Uses a signed, HTTP-only role-aware development cookie.
- Avoids the Safari/Vercel `The string did not match the expected pattern` failure.
- Keeps PostgreSQL authentication unchanged and available on the same login screen.
- Development access remains disabled unless local development has no `DATABASE_URL`, or `DEV_AUTH_ENABLED=true` is explicitly set.
