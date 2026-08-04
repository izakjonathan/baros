# Bar Ops v0.17.0

Current release: **v0.17.0** — Architecture Cleanup & Redesign Readiness.

This release creates a safer foundation for Phase D by extracting shared workspace domain contracts and pure schedule logic from the manager application shell, documenting stable redesign boundaries, and adding a complete cross-workspace redesign inventory.

No database migration, permission change, business feature, API contract change, workflow change, or intentional visual redesign is introduced.

Rollback checkpoint: **v0.16.21.3**.

Hospitality operations system built with Next.js, TypeScript and PostgreSQL for Vercel and Neon.

## Architecture foundation

- Workspace domain contracts live in `features/workspace/types.ts`.
- Pure date, conflict, overnight and database-shift mapping logic lives in `features/workspace/schedule-utils.ts`.
- Shared interaction primitives remain in `components/ui/`.
- Current visual tokens remain centralized in `app/mono-tokens.css` and form the controlled entry point for Phase D.
- Stable redesign boundaries are documented in `docs/architecture.md`.
- Manager, employee, component and state coverage is listed in `docs/redesign-inventory.md`.

## Phase D boundary

Phase D may change visual hierarchy, typography, tokens, component presentation, responsive composition and motion. It must preserve routes, API contracts, role permissions, tenant isolation, persisted data and workflow semantics unless separately approved.

## Validation

Use the consolidated gates:

```bash
npm run audit:preflight
npm run validate:release
npm run test:all
npm run lint
npm run typecheck
npm run build
```

## Database

Use `DATABASE_URL` for the pooled Neon runtime URL and `DATABASE_DIRECT_URL` for migrations.

## Production health checks

- `GET /api/health/live` checks application liveness without requiring the database.
- `GET /api/health/ready` checks bounded database readiness and reports duration.
- `GET /api/health` remains a backwards-compatible readiness alias.

## Installed app

The web app manifest, Apple metadata, icons and `public/sw.js` remain included. The service worker does not cache authenticated API responses or operational pages.
