# Bar Ops v0.8.4

Hospitality operations workspace for scheduling, attendance, inventory, ordering, employee self-service, and payroll workflows.

This release fixes assigned shifts displaying as “Unassigned” immediately after creation or reassignment. PostgreSQL shift mutation responses now include the employee display name expected by the manager schedule mapper.

## Deployment

Commit the ZIP to the `baros` GitHub repository. GitHub Quality Checks and Vercel will run automatically. No database migration is required.

## v0.8.5 database upgrade

After committing this release, run **GitHub → Actions → Database administration → migrate**, then run **verify**. Migration 009 is required before using the new stock, receiving, transfer, waste, or concurrency protections.
