# Bar Ops v0.8.8

This release redesigns the Shift plan workspace for a denser week/month overview, horizontal day navigation, and date-aware quick shift creation. See `RELEASE_NOTES.md` for details.

Hospitality operations workspace for scheduling, attendance, inventory, ordering, employee self-service, and payroll workflows.

This release fixes assigned shifts displaying as “Unassigned” immediately after creation or reassignment. PostgreSQL shift mutation responses now include the employee display name expected by the manager schedule mapper.

## Deployment

Commit the ZIP to the `baros` GitHub repository. GitHub Quality Checks and Vercel will run automatically. No database migration is required.

## v0.8.6 database upgrade

After committing this release, run **GitHub → Actions → Database administration → migrate**, then run **verify**. Migration 009 is required before using the new stock, receiving, transfer, waste, or concurrency protections.


## v0.8.6
Team cards show published scheduled hours for the next four weeks based on live shift assignments.