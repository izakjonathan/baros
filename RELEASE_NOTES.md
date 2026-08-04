# Bar Ops v0.16.17 — Production Hardening XVII & XVIII

Built from the approved v0.16.15.1 Order Route TypeScript Hotfix baseline.

## v0.16.16 — Operational Observability

- Added centralized application release metadata.
- Health endpoints now identify the running version, environment and shortened Vercel commit SHA.
- API responses receive version and commit headers through the shared request boundary.
- Structured server logs now include service, version, environment and deployment commit context.
- Readiness checks now report and log their execution duration.
- No secrets, full deployment URLs or database connection details are exposed.

## v0.16.17 — Release & Recovery Guardrails

- Added `npm run validate:release`.
- GitHub Quality Checks now execute release validation before the existing gates.
- Release validation checks package/document version consistency, Node 24 workflows, required service-worker presence and forbidden deployment files.
- Added focused v0.16.16 and v0.16.17 regression suites.
- Documented v0.16.15.1 as the approved rollback checkpoint with minimum post-rollback health and authentication checks.

## Compatibility

- No database migration.
- No role or permission changes.
- No business-feature additions.
- No route removal or intentional successful-response break.
