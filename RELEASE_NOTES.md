# Bar Ops v0.18.2 — Dashboard & Overview Redesign

Phase D dashboard redesign built from v0.18.2. It introduces a feature-owned dashboard CSS Module, stronger operational hierarchy, responsive KPI layouts, a prominent live shift board, structured attention and timeline panels, an inverse operational summary, and clearer quick actions. Existing calculations, API requests, role access and navigation targets are unchanged. No migration is required.

# Release Notes — v0.18.2

## Combined Phase D build

### v0.18.0 — Design System Foundation

- Added layered CSS architecture: reset, tokens, base, layouts, components and utilities.
- Added primitive and semantic colour tokens, typography, spacing, radius, shadow, layout, motion and layering tokens.
- Added compatibility aliases so existing workspace UI remains stable during phased migration.
- Added locally scoped Button, Card and Badge primitives.
- Added the agreed Phase D design-system principle to architecture and workflow documentation.

### v0.18.2 — Application Shell & Navigation

- Applied locally scoped CSS Modules to the manager sidebar/topbar and employee header/bottom navigation.
- Improved shell hierarchy, active navigation, location context, touch behavior and responsive surfaces.
- Preserved role permissions, navigation destinations and workspace content.

No database migration or business-feature change is included.
