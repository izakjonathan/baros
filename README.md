# Bar Ops

**Current release: v0.11.0 — UI Architecture**

Bar Ops is a Next.js hospitality operating system for scheduling, employee self-service, time and attendance, payroll export, inventory, ordering, and daily operations. It deploys through Vercel and uses PostgreSQL/Neon in production.

## Design architecture

- `app/design-tokens.css` — canonical colour, type, spacing, shape, control, and shell tokens
- `app/design-system.css` — shared primitive and pattern styling
- `app/globals.css` — feature-specific structural layout only
- `components/ui-primitives.tsx` — shared React controls
- `components/bar-ops-app.tsx` — manager feature composition

Change semantic tokens or shared primitives first; avoid adding page-specific alternatives for existing controls.

## Commands

```bash
npm install
npm run test:all
npm run typecheck
npm run build
```

Use `DATABASE_URL` for the pooled Neon runtime connection and `DATABASE_DIRECT_URL` for migrations. v0.11.0 adds no migration.
