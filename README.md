# Bar Ops v0.7.4

Employee portal access release for the iPad-first `baros` workflow. Managers can create an employee, generate a secure activation link, share it from the iPad share sheet, and track invitation/activation status. Employees set their own password and are routed to the employee portal.

Run `npm run db:migrate` to apply migration `007_employee_portal_access.sql`. See `RELEASE_NOTES.md` and `IPAD_NEON_VERCEL_SETUP.md`.
# Bar Ops v0.7.1

Security and transaction-integrity remediation release. Run `npm run db:migrate` to apply migration 006 and `npm run test:remediation` with the existing regression suites. See `RELEASE_NOTES.md` and `IMPLEMENTATION_STATUS.md`.

# Bar Ops v0.5.0 v0.2.0 — Persistent Foundation

A Vercel-ready Next.js hospitality operations platform with a PostgreSQL data layer, custom database-backed authentication, multi-organization/location tenancy, manager workspace, and employee self-service portal.

## Included

- PostgreSQL schema and repeatable SQL migrations
- Secure scrypt password hashing and opaque database sessions
- Roles: Owner, Admin, Manager, Shift Manager, Employee
- Organization and multi-location model
- Persistent employees, shifts, products, suppliers, inventory and purchase orders
- Employee portal for published shifts
- Availability and time-off requests
- Tenant-scoped audit history
- Persistent in-app notifications
- Seeded manager and employee demo accounts
- Existing responsive manager UI retained from v0.1.0

## Local setup

1. Create a PostgreSQL database (Vercel Postgres/Neon-compatible connection strings work).
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL`.
3. Install dependencies: `npm install`
4. Run migrations: `npm run db:migrate`
5. Seed demo data: `npm run db:seed`
6. Start: `npm run dev`

Manager demo: `owner@barops.local` / `ChangeMe123!`
Employee demo: `maya@barops.local` / `Employee123!`

Change both passwords immediately outside local development.

## Vercel deployment

- Import the repository into Vercel.
- Add `DATABASE_URL`, `SESSION_COOKIE_NAME`, `SESSION_TTL_DAYS`, `SEED_OWNER_EMAIL`, and `SEED_OWNER_PASSWORD`.
- Run migrations against the production database before first use.
- Deploy with the standard Next.js preset.

## Architecture notes

All operational tables carry an organization boundary. Location-owned data additionally carries a location ID. API routes derive organization, location and role from the server-side session and never accept organization identity from client input.

The current manager UI preserves the v0.1.0 demo presentation while the full persistence layer and employee portal are now available. The next release should replace each manager module’s local demo state with its corresponding API/repository and add manager request approval, location switching, invitation flows, order editing, and notification read states.

## v0.3 shift workflows

The shift creation API accepts an optional recurrence object:

```json
{
  "employeeId": null,
  "isOpen": true,
  "role": "Bartender",
  "startsAt": "2026-08-07T17:00:00.000Z",
  "endsAt": "2026-08-08T01:00:00.000Z",
  "recurrence": {
    "frequency": "WEEKLY",
    "weekdays": [1, 5, 6],
    "count": 6
  }
}
```

Weekdays in the API use JavaScript/PostgreSQL numbering: Sunday `0`, Monday `1`, through Saturday `6`. Daily recurrence uses `frequency: "DAILY"` and `count` for the number of generated shifts.

Open-shift requests use `/api/shift-claims`. Handovers and swaps use `/api/shift-transfers`. Both workflows preserve manager approval and audit history.


## Database-free development login

The app can now be opened before PostgreSQL is configured. In local development, leave `DATABASE_URL` unset and start the app with `npm run dev`. Sign in with:

- Email: `dev@barops.local`
- Password: `dev`

This fallback only exposes the existing local-state manager workspace. Database-backed API routes and the employee portal still require PostgreSQL. Once `DATABASE_URL` is configured, the normal database authentication flow takes over automatically.

For a temporary Vercel preview without a database, set `DEV_AUTH_ENABLED=true`, `DEV_AUTH_SECRET` to a long random value, and optionally change `DEV_AUTH_EMAIL` and `DEV_AUTH_PASSWORD`. Remove or disable the flag when the database is connected.


## v0.3.5 mobile dialog behavior
Dialogs scroll independently on iOS Safari and keep their header and action area visible.

## Editing existing shifts

In the Shift plan, tap or click any shift card to open it. Managers can reassign it to another employee, change it to an Available shift, assign an open shift to an employee, edit its day/role/times/status, or delete it. In development mode these changes use local state; after PostgreSQL is connected the manager workspace will be wired to the persistent shift APIs.

## v0.3.8 development workflows
Copy previous week duplicates the immediately preceding week into the currently visible week as drafts. Publish week publishes every draft in the visible week. Team records can be added and edited in local development state. Shift creation and editing now use calendar dates. These local changes reset after a full refresh until PostgreSQL manager APIs are connected.

## v0.3.9 Time & attendance
Adds scheduled-versus-worked hour reporting, employee period totals, clock in/out and breaks, manager timesheet approval, and PostgreSQL migration `003_time_attendance.sql`. In database-free development mode the screens use demo state; with PostgreSQL the new APIs provide persistent punches and timesheets.

## v0.4.0 verification

```bash
npm run test:logic
npm run build
```

Overnight shifts belong to the calendar date on which they start. An end time earlier than the start time is displayed as ending the following day and does not move the shift to that day.

## v0.4.1 payroll workflow
The manager Time & attendance module now uses a strict review → approve → export flow. Pending/running records are excluded from CSV exports. Choose a From/To period, approve individual records or all pending records in the filtered view, then export employee-level approved-hour totals. With PostgreSQL connected, `GET /api/timesheets/export?from=YYYY-MM-DD&to=YYYY-MM-DD` provides the tenant-scoped CSV export.


## v0.5.0 audit commands

```bash
npm run test:logic
npm run test:payroll
npm run test:audit
```

Read `DEEP_PRODUCT_AUDIT.md` and `RESEARCH_MATRIX.md` for the full product review and prioritised roadmap.

## v0.6.1 development additions

- Schedule overlap detection and publish blocking
- Recurring series edit scope
- Payroll period locking before export
- Employee correction requests
- Migration `004_payroll_integrity.sql`
- `npm run test:integrity`


## v0.6.1 migration

Run `npm run db:migrate` to apply the production operations schema in `db/migrations/005_production_operations.sql`. See `IMPLEMENTATION_STATUS.md` for the exact implementation boundary.

## v0.7.0 development workflow

Development mode now persists the manager workspace in browser localStorage. Inventory changes, stock counts, operational tasks, and handover notes survive refreshes.

Use **Control centre → Development data** to:

- Export the current workspace as JSON
- Import a previous JSON backup
- Reset to the original demo data

Run the new regression suite with:

```bash
npm run test:inventory
```

## v0.7.2 iPad database administration

The repository is configured for the GitHub repository named `baros` and includes browser-operated GitHub Actions:

- **Database administration** — manually verify, migrate, or intentionally seed Neon.
- **Quality checks** — runs regression tests and a production build on `main`, pull requests, or manually.

See [`IPAD_NEON_VERCEL_SETUP.md`](./IPAD_NEON_VERCEL_SETUP.md) for the complete Safari/iPad flow. Database credentials belong in GitHub Actions secrets and Vercel environment variables; they must never be committed.

Seeding is protected by both a workflow confirmation phrase and the `ALLOW_DATABASE_SEED=SEED BAROS` process guard.
