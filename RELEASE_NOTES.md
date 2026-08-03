# Bar Ops v0.10.9 — Production Typecheck Gate

Built directly from v0.10.8.

This narrowly scoped release fixes the Vercel production typecheck failure in the employee hours-summary route by typing the SQL result at the query boundary. It does not change the API response shape or employee workspace behavior.

See `RELEASE_NOTES_V0109.md` for the exact change and validation limitations.
