# Release Notes — v0.19.0-rc.30

## Global Tail & Ownership Consolidation

Compared with rc.29:

- CSS declarations reduced from **5,999 to 5,510**.
- CSS bytes reduced from **206,485 to 184,658**.
- `globals.css` reduced to **31,896 bytes**.
- `!important` declarations reduced from **13 to 11**.
- The historical v0.9.5–v0.18.4.12 release-patch tail was removed from `globals.css`.
- Remaining live employee/dashboard/execution/schedule/team styles were migrated to their actual owners.
- Redundant employee availability compatibility CSS was removed from `mono-components.css`.
- The spacing compatibility stylesheet now contains only the live page-flow contract.
- Historical black-canvas tests now validate current token/base/shell ownership instead of requiring deleted global patches.

No migration required.
