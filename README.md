# Bar Ops — v0.19.0-rc.30

Bar Ops release candidate focused on aggressive global CSS tail consolidation and feature ownership.

Current release: **v0.19.0-rc.30**

## v0.19.0-rc.30

This release removes the historical release-patch tail from `app/globals.css`, migrates the remaining live styles to their owning Employee, Dashboard, Shift Execution, Schedule and Team stylesheets, removes the redundant employee availability compatibility block, and collapses the spacing compatibility layer to its live page-flow contract.

No business logic, API, database, permission, or workflow changes are included.

Rollback checkpoint: **v0.19.0-rc.29**.
