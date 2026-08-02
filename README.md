# Bar Ops

**Current release: v0.11.7 — Compact Floating Menu**

Bar Ops is a Next.js hospitality operating system for scheduling, employees, attendance, payroll, inventory, ordering and daily bar operations. It is designed for Vercel, Neon PostgreSQL and iPhone/iPad standalone PWA use.

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run test:all
npm run lint
npm run typecheck
npm run build
```

Browser smoke tests:

```bash
npx playwright install
npm run test:e2e
```

Live PostgreSQL integration checks require a disposable database:

```bash
TEST_DATABASE_URL=postgres://... DATABASE_URL=$TEST_DATABASE_URL npm run db:migrate
TEST_DATABASE_URL=postgres://... npm run test:postgres-integration
```

## Database

Use `DATABASE_URL` for the pooled Neon runtime connection and `DATABASE_DIRECT_URL` for migrations. v0.11.7 adds migration `011_daily_operations.sql`.

After deploying this release, run **Database administration → migrate**, then **verify**.
