# v0.3.1 — Database-free development login

- Adds an isolated development authentication mode that does not require PostgreSQL.
- Enables automatically during local development when `DATABASE_URL` is absent.
- Supports temporary Vercel previews through `DEV_AUTH_ENABLED=true`.
- Uses an HTTP-only HMAC-signed session cookie.
- Preserves the real database-backed login and switches to it automatically when development auth is disabled.
- Default local credentials: `dev@barops.local` / `dev`.
- Database-backed employee pages and API persistence still require PostgreSQL.

# Bar Ops v0.3.0 — Shift workflows

Built from the v0.2.0 persistent foundation.

## Added
- Daily recurring shifts for a specified number of occurrences.
- Weekly recurring shifts with selectable weekdays and a week count.
- Recurrence-group storage while keeping every generated shift independently editable.
- Assigned shifts and open/available shifts.
- Employee requests for open shifts, with manager approval and competing-request rejection.
- Employee handover requests to a named colleague.
- Employee shift swaps using a selected colleague shift.
- Receiving-employee acceptance before manager approval.
- Transactional final assignment and swapping.
- Audit events for shift series, open-shift requests, and transfer requests.
- Employee portal UI for open shifts, claims, handovers, and swaps.
- Expanded manager shift dialog for recurrence and assignment mode.

## Database migration
Run `npm run db:migrate` after deployment to apply `002_shift_workflows.sql`.

## Validation note
The source tree, migration files, scripts, and archive were structurally validated. A complete dependency install/build could not run in this workspace because its internal npm mirror returns 404 for standard scoped packages such as `@types/node`.
