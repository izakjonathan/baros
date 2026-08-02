# Bar Ops v0.11.3 — UI Architecture Build Fix

This patch corrects the Vercel TypeScript failure introduced in v0.11.2 after the shared KPI component migration.

- Replaces the removed local `Metric` reference in Time & Attendance with the shared `KpiCard` primitive.
- Adds the required `KpiCard` import.
- Preserves the v0.11.2 PostgreSQL Daily Operations migration and integration-test workflow.
- No database schema changes beyond migration 011 from v0.11.2.
