# Bar Ops v0.10.7 — Employee workspace integrity

Built directly from the approved v0.10.5 CSS ownership cleanup release.

## Fixes

- Restored the owner top bar's canonical flex layout without reintroducing duplicate selectors or `!important`.
- Added an explicit owner-workspace Sign out action using the existing logout API.
- Employee My Hours now always exits its loading state when either request fails.
- Hours summary no longer fails when the optional correction-request table is unavailable; correction status falls back safely.

No unrelated components, layouts, design tokens, migrations, or workflows were changed.

## v0.10.7 — Employee workspace integrity

- Resolves development-role sessions against real seeded organization, location, user and employee records instead of sending placeholder identifiers into PostgreSQL queries.
- Resolves real employee sessions through an active, organization-scoped employee profile.
- Validates a stored session location and uses the employee's primary active assigned location when the stored location is missing, inactive or stale.
- Preserves explicit employee-workspace validation messages for missing employee or location linkage.
- Adds a focused regression test for the employee session and location resolution chain.
