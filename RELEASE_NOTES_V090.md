# v0.9.0 — Employee activation reliability

- Makes employee account activation one atomic PostgreSQL transaction.
- Creates the login session in the same transaction as account activation.
- Adds migration 010 to guarantee required timestamp columns and remove an RLS role mismatch risk for server-side invitation access.
- Verifies the employee link and invitation status transition before committing.
- Serializes audit JSON explicitly for postgres.js.
- Adds activation reliability regression tests.

After deployment, run Database administration → migrate, then verify. Generate a fresh invitation afterward.
