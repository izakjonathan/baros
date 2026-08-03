# Bar Ops v0.10.10 — Employee Hours and Location Assignment

Built from v0.10.9.

## Fixed

- Replaced the production-failing scheduled-hours aggregate with a PostgreSQL-safe `date_part` query.
- Split scheduled and approved totals into independently typed queries.
- Added primary-location selection to Add Employee and Edit Employee.
- Added transactional employee-location reassignment with organization and active-location validation.
- Prevented portal-enabled employees from being left without a location.
- Returned primary assignment metadata from manager bootstrap.
- Disabled employee clock actions when either employee linkage or location linkage is missing and exposed the exact reason.

## Scope

No owner-shell redesign or unrelated refactor is included.
