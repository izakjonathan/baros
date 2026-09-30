# Development workflow

Operation is the only product scope in this repository. Unless explicitly requested, changes belong only to login, activation, `/operation`, its shared staff route, and their APIs.

1. Start from the latest approved release.
2. Preserve organization/location authorization and the Owner/Manager/Employee/shared-link distinctions.
3. Keep employee workflows simpler than common single-purpose apps.
4. Add or update regression checks for every behavior change.
5. Run the full commands in `docs/testing.md`.
6. Package source only; exclude `.next`, `node_modules`, `.env*`, `.vercel`, and local logs.

Historical legacy database migrations remain until the old product is extracted to another repository. Do not reintroduce legacy pages or APIs here.
