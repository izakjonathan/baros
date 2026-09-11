# v0.19.0-rc.64 — Owner Operation Access

## Baseline

- Continued from v0.19.0-rc.63 after the Operation reader and typography cleanup. That release is the rollback checkpoint.

## Access fix

- Added an Operation item to the owner/manager workspace navigation.
- The item opens `/operation`, where OWNER and ADMIN users can access the Handbook and News editor.
- Preserved the standalone Operation module design, so `/operation` still does not render inside the main side-menu shell.

## Scope

No dependency, database-schema, route-shape, permission, or existing business-workflow changes are included. The change is limited to exposing the existing standalone Operation module from the owner workspace.

Rollback checkpoint: **v0.19.0-rc.63**.
