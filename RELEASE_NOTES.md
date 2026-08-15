# Release notes — v0.19.0-rc.35

## Sub-4000 CSS Consolidation

Baseline: v0.19.0-rc.34.

This release continues the CSS consolidation without adding another override layer. It removes unused design-token declarations and superseded declarations whose property is redefined later for every selector branch under the exact same cascade context. The winning computed declarations are preserved while historical/live duplication is reduced.

### CSS result

- 25 CSS files
- 3,948 structurally parsed declarations
- 1,396 parsed rules
- 137,224 bytes of CSS
- 9 `!important` declarations
- 52 unused custom-property declarations removed
- 135 provably superseded declarations removed across Employee, Attendance, Daily Operations, Inventory, Dashboard, Requests, Orders, Schedule and ManagerShell

No API, database, authorization, permission, workflow, or feature changes are included. No migration is required.
