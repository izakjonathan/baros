# Implementation Status — v0.19.0-rc.35

Current focus: CSS ownership and declaration consolidation.

- CSS reduced to 3,948 structurally parsed declarations across 25 files.
- 52 unused custom-property declarations removed after runtime/source usage tracing.
- 135 superseded declarations removed only where every selector branch receives the same property later in the exact same cascade context.
- Schedule remains module-owned; Employee, Attendance, Inventory, Orders, Requests, Daily Operations, Dashboard and ManagerShell retain their scoped owners.
- CSS `!important` usage remains at 9 declarations.
- No application behavior changes.
