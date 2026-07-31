# v0.2.0 — Persistent Foundation

## Added
- PostgreSQL domain schema and migration runner
- Organization and multi-location tenancy
- Database sessions and role-based access
- Persistent domain APIs for employees, shifts, products, orders, requests and availability
- Employee mobile portal
- Time-off and availability request submission
- Audit log service and audit API
- Persistent notification service and notification API
- Production-oriented seed workflow

## Preserved
- Complete v0.1.0 responsive manager frontend
- Existing visual language, navigation and demo interactions

## Deliberate boundary
The manager screens remain visually compatible with v0.1.0 while persistence is introduced through server APIs. This minimizes a risky full UI rewrite in the same release. Subsequent versions can migrate each manager module from local presentation state to the persistent APIs one workflow at a time.
