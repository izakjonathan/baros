# Validation Log — v0.10.10

## Passed

- Complete inherited regression suite through v0.10.1.
- v0.10.2 through v0.10.10 focused regression suites.
- Focused employee-hours and location-assignment assertions.
- ZIP integrity validation.

## Production evidence addressed

- PostgreSQL `42601` failure from `/api/employee/hours-summary` was traced to the scheduled-hours aggregate and replaced with a `date_part` expression in a separate typed query.
- Employee portal linkage was active, but no manager UI or PATCH operation existed for `employee_locations`; both are now implemented.

## Not run locally

- Dependency-backed Next.js production build, ESLint and full TypeScript check were not available in this packaging environment. Vercel deployment remains the production build gate.
