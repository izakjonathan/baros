# Bar Ops

**Current release: v0.13.2 — Floating Navigation Placement**

Bar Ops is a Next.js operational workspace for scheduling, timesheets, payroll, inventory, orders, daily operations, and employee self-service.

## Presentation architecture

The interface now has three explicit layers:

- `app/design-tokens.css` — semantic colours, typography, spacing, radii, and dimensions.
- `app/globals.css` — feature-specific geometry only.
- `app/product-system.css` — the only shared presentation layer for manager and employee roles.

Legacy employee and shared-component presentation rules were removed from `globals.css`. The employee portal and manager workspace now consume the same fonts, surfaces, controls, cards, and interaction states.

## Verification

```bash
npm install
npm run test:all
npm run typecheck
npm run build
```

GitHub Quality Checks should pass before promoting a Vercel deployment. Confirm that the commit SHA in Vercel matches the tested GitHub commit.

## Database

Use `DATABASE_URL` for the pooled Neon runtime connection and `DATABASE_DIRECT_URL` for migrations. Migration `011_daily_operations.sql` remains the latest schema migration.
