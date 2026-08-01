# Bar Ops v0.7.2 — iPad database operations

Built on v0.7.1 Integrity Remediation.

## Added

- Manual **Database administration** GitHub Action for the `baros` repository.
- Selectable `verify`, `migrate`, and `seed` operations from Safari on iPad.
- Exact `SEED BAROS` confirmation requirement for seeding.
- Serialized database-administration runs to prevent simultaneous migrations/seeding.
- GitHub production Environment support for optional approval protection.
- Required-secret validation without printing secret values.
- `db:verify` command that checks the Neon connection, all migrations, and core row counts.
- Automatic verification after migrations and seeding.
- **Quality checks** action for pushes to `main`, pull requests, and manual runs.
- Complete regression-suite command: `npm run test:all`.
- Real Next.js production build in GitHub Actions.
- Explicit seed-script safety guard and removal of fallback Owner credentials.
- iPad-only setup guide for Commit app → GitHub `baros` → Vercel → Neon.

## Operational notes

GitHub repository secrets required:

- `DATABASE_URL`
- `DATABASE_DIRECT_URL`
- `SEED_OWNER_EMAIL`
- `SEED_OWNER_PASSWORD`

The database workflow never prints connection strings or passwords. Existing application functionality from v0.7.1 is preserved.
