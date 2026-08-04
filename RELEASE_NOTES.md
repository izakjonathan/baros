# Release Notes — v0.18.4.3

## Mobile Dialog & Cross-Screen Consistency

- Rebuilt the employee editor as a viewport-safe mobile dialog with fixed heading, independently scrolling form content and safe-area-aware sticky actions.
- Removed the white dialog heading, backdrop blur, shadow treatment and oversized mobile controls.
- Restored a visible icon inside the mobile Add employee action.
- Tightened Team card spacing and metadata density.
- Aligned scheduling with the approved pink shift identity and removed blue, green, grey, white-card and shadow treatments.
- Compacted schedule period controls and retained touch-safe horizontal scrolling.
- Converted Shift execution metrics into a compact two-column functional-colour grid.
- Simplified Operational summary into one black surface with divided metrics rather than rounded cards within a card.
- Compacted mobile dashboard panel actions and normalized metric-card rhythm.
- No business logic, permissions, APIs, database schema or workflow behavior changed.

# Release Notes — v0.18.4.2 Visual System Alignment Pass

- Unified the light page, header, safe-area, and overscroll background to approved beige.
- Corrected the mobile Add employee action to an icon-only circular control.
- Reduced Team card height, divider count, and internal whitespace.
- Simplified Team search/filter controls and result metadata.
- Converted dashboard metrics to approved content colors and removed shadows, gradients, decorative sparkle icons, and pale bordered-card treatment.
- Removed the unapproved green location indicator.

# v0.18.4.2 — JSX Build Hotfix

- Fixed an extra closing `</div>` in the dashboard Quick Actions section that caused Turbopack to fail parsing `components/bar-ops-app.tsx`.
- No visual, workflow, permission, API, or database behavior changed.

# Release Notes — v0.18.4.2

## Phase D Visual Design System Brief

- Formalized the approved beige/black, neon, pink, blue and orange visual direction.
- Defined no-shadow, no-gradient and no-glow rules.
- Defined semantic content colours, typography, buttons, icons, cards, grids, responsive behavior and accessibility expectations.

## Employees & Team Redesign

- Added a feature-owned Team workspace CSS Module.
- Applied neon employee/team identity and compact two-column cards.
- Added concise team summary cards, clear access status, bold hierarchy and rounded outline/filled actions.
- Preserved employee search, filtering, scheduled-hour calculations, editing, invitation and revocation behavior.

# Release Notes — v0.18.3

## Scheduling Workspace Redesign

- Added a feature-owned scheduling CSS Module.
- Redesigned period controls, publication status, conflict review and acknowledgement actions.
- Added sticky day headers, clearer today treatment and role-coded shift cards.
- Improved draft, conflict and availability-conflict visibility.
- Added intentional mobile/iPad horizontal scheduling with touch-safe controls.
- Preserved drag-and-drop, recurring shifts, overnight shifts, copy-week and publishing behavior.

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
