# Bar Ops

Bar Ops is a Next.js hospitality operating system for scheduling, employees, attendance, payroll, inventory, purchasing and daily operations.

## Current release

Version: **0.17.0**

## UI styling

The root layout imports one entrypoint, `app/globals.css`, which owns the explicit cascade order:

- `app/styles/tokens.css`
- `app/styles/reset.css`
- `app/styles/legacy-geometry.css`
- `app/styles/components.css`

See `UI_ARCHITECTURE.md` for the ownership rules and migration policy.

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

## Database

Use the GitHub **Database administration** workflow for migrations and verification when working from iPad. Existing migrations remain unchanged in v0.17.0.
