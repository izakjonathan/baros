# Bar Ops — v0.19.0-rc.35

Bar Ops release candidate focused on aggressive CSS consolidation and deterministic style ownership.

Current release: **v0.19.0-rc.35**

## v0.19.0-rc.35

This release takes the live stylesheet below 4,000 structurally parsed declarations by removing unused design tokens and declarations that are provably superseded later in the same cascade context. It preserves the existing visual direction and behavior while reducing styling ambiguity and maintenance cost.

No business logic, API, database, permission, or workflow changes are included.

Rollback checkpoint: **v0.19.0-rc.34**.
