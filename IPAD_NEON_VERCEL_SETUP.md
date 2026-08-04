# iPad-only Neon and Vercel setup for `baros`

This project is designed to support the following workflow without a desktop computer:

`Bar Ops ZIP → Commit app → GitHub baros repository → Vercel → Neon PostgreSQL`

## One-time GitHub secrets

Open the `baros` repository in Safari:

1. **Settings**
2. **Secrets and variables**
3. **Actions**
4. **New repository secret**

Create:

- `DATABASE_URL` — Neon pooled connection URL
- `DATABASE_DIRECT_URL` — Neon direct connection URL
- `SEED_OWNER_EMAIL` — initial Owner email
- `SEED_OWNER_PASSWORD` — unique password of at least 12 characters

Do not add quotes around values in GitHub's secret form.

## Run migrations from iPad

1. Open `baros` on GitHub.
2. Select **Actions**.
3. Select **Database administration**.
4. Tap **Run workflow**.
5. Choose `migrate`.
6. Leave seed confirmation empty.
7. Tap the green **Run workflow** button.
8. Open the workflow run and confirm every step is green.

The workflow automatically verifies the database after migrating.

## Seed the database once

1. Open **Actions → Database administration → Run workflow**.
2. Choose `seed`.
3. Enter exactly `SEED BAROS` in the confirmation field.
4. Run the workflow.

The seed script refuses to run without that confirmation and the required owner secrets.

Do not repeatedly seed a database that already contains real data unless you intentionally want the seed's upsert behaviour.

## Verify at any time

Choose `verify` in the same workflow. It checks:

- Connection to Neon
- All six migrations
- Core organization, location, user, employee, and product counts

It does not print database passwords or connection strings.

## Vercel variables

In Vercel, open **baros → Settings → Environment Variables** and add to Production:

- `DATABASE_URL`
- `DATABASE_DIRECT_URL`
- `APP_URL`
- `DEV_AUTH_ENABLED=false`
- `SESSION_COOKIE_NAME=bar_ops_session`
- `SESSION_TTL_DAYS=30`

Redeploy after changing variables.

`DATABASE_DIRECT_URL` is used by migration administration. The running Vercel app uses the pooled `DATABASE_URL`.

## Quality checks

Every push to `main` runs **Quality checks**. This installs dependencies, runs the complete regression suite, and performs a real Next.js production build. A failed check does not delete the commit, but it clearly shows that the release should not be promoted until corrected.

## GitHub Environment protection

The database action uses a GitHub Environment named `production`. GitHub creates it automatically on the first run if it does not already exist. You may optionally configure required reviewers under:

**Settings → Environments → production**

This adds an approval step before migrations or seeding can touch the production database.
