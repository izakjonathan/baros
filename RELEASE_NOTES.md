# Release Notes — v0.18.4.16

## Shift Plan Simplification

- Simplified the week overview and reduced its visual bulk.
- Removed the full-height color fill from the day body so the grid reads more cleanly.
- Kept the day header cell filled while making the shift area quieter.
- Reduced shift-card size and typography for a denser weekly schedule.
- Kept employee names to first name only on shift cards.
- Added clearer role-based shift colors for Bartender, Floor and Kitchen.
- Reduced the add-shift control to a small inline indicator below the last shift in each day.
- Preserved the existing scheduling workflows and horizontal mobile week scroll.

# Release Notes — v0.18.4.14.1

## Quality Check Ordering Hotfix

- Added a dependency-free `audit:artifacts` gate.
- Moved forbidden-artifact validation before `npm install` in GitHub Actions.
- Prevented the stabilization preflight from treating install-created `node_modules` as a packaged release artifact.
- Continued to reject repository-level `vercel.json`, `.vercel`, and `public/offline.html`.
- Documented the required one-time deletion of the existing tracked `vercel.json`.
- No application behavior, permissions, APIs, database schema, or UI was changed.

# Release Notes — v0.18.4.14

## Single-Owner Page Flow

- Added a canonical workspace flow wrapper.
- Removed compounded spacing caused by parent gaps plus section margins.
- Normalized top-level Dashboard, Team, Shift Plan and fragment-based workspaces.
- Ensured nested grids use the same row and column gap without outer margins.
- Preserved internal card padding and all application behavior.

# Release Notes — v0.18.4.13

## Spacing Ownership Cleanup

- Made the 8px external grid authoritative after all legacy CSS.
- Unified mobile, tablet and desktop page gutters.
- Unified spacing around page-level titles and descriptions.
- Unified manager and employee workspace section spacing.
- Unified dashboard, attendance and execution metric-grid gaps.
- Aligned top-bar controls with page content.
- Removed obsolete hard-coded external spacing from key legacy selectors.
- Preserved internal component padding and the intentional mobile schedule full-bleed data surface.

# Release Notes — v0.18.4.12

## Compact External Grid

- Reduced the site-wide external layout gap from 16px to 8px.
- Reduced visible black/background channels between content.
- Kept page edges, section gaps and card-grid gaps exactly aligned.
- Preserved card interior padding and component density.
- No functional behavior changed.

# Release Notes — v0.18.4.11

## Unified Grid Spacing System

- Added a single 16px external grid spacing token.
- Applied it to page edges, section separation, card grids and title rhythm.
- Aligned Dashboard, Team, Shift Plan, Time & Attendance and employee pages to the same grid.
- Removed mobile-specific external gap drift while preserving safe-area insets.
- Kept internal card padding separate from layout spacing.

# Release Notes — v0.18.4.10

- Changed the red-orange palette value everywhere from `#FD2200` to the sampled reference color `#EB6746`.
- Removed top safe-area padding from inside the fixed manager top bar.
- Positioned the top bar below `safe-area-inset-top` and moved the same inset into shell content offset.
- Prevented the top control row from shifting upward after scrolling begins in iOS Safari.
- No workflow, permission, API, database or business-logic changes.

# Release Notes — v0.18.4.9

## Palette & Spacing Alignment

- Replaced orange with `#EB6746`.
- Replaced blue with `#9561E6`.
- Fixed the top bar in place using sticky positioning.
- Added purposeful colour variation to top-bar controls.
- Reduced and aligned page gutters, section gaps and card gaps.
- Preserved light/dark mode and all existing workflows.

# Release Notes — v0.18.4.8

## Mobile Layout Repair

- Rebuilt the mobile Time & Attendance layout around contained single-column filters.
- Replaced clipped empty output with a centered, descriptive empty state.
- Compacted payroll preview cards and removed oversized empty areas.
- Preserved responsive timesheet cards for actual records.
- Contained Shift Plan view, copy, add, acknowledgement, conflict and publication controls.
- Protected visible previous/next arrows and prevented non-calendar horizontal overflow.
- Preserved intentional horizontal scrolling inside the calendar only.
- No business behavior, API, permission or database change.

# Release Notes — v0.18.4.7

- Added persistent light/dark mode and a top-bar theme switch.
- Added black page/shell backgrounds with beige neutral content in dark mode.
- Reduced top-bar height, card radius and visual softness.
- Removed leading metric-card icons and increased card-title size.
- Refined Time & Attendance responsive actions, filters, metrics and cards.
- Refined Shift Plan controls, publication state, day surfaces and shift cards.

# Release Notes — v0.18.4.6

## Mobile Density & Responsive Structure

- Reduced the manager top bar and mobile control dimensions.
- Changed the location switcher from a gradient to approved solid pink.
- Shortened supporting copy in Team and Time & Attendance.
- Restored Team’s neon editorial heading block.
- Reflowed Time & Attendance actions into one primary row and one secondary row on mobile.
- Reduced filter and metric-card height.
- Replaced the mobile timesheet table with stacked responsive cards.
- Changed Exceptions to a filled pink card rather than a beige outlined exception.
- Removed remaining low-contrast olive and disabled-state treatments from the refined screens.
- Preserved all existing workflow, permission, API and data behavior.

# Release Notes — v0.18.4.5

## Top Bar & Attendance Refinement

- Removed the manager top-bar bottom border for a cleaner continuous shell.
- Restyled top-bar buttons into rounded black controls with light icons.
- Restyled the location selector into a gradient pill matching the supplied visual reference direction.
- Hid the extra workspace-context copy in the top bar so the shell reads more cleanly on mobile.
- Refined Shift Plan header controls to use the same updated chrome language.
- Added an editorial pink title block to Time & attendance.
- Added an orange filter surface and clearer coloured attendance metrics.
- Preserved all existing business logic, permissions, APIs, database behavior and workflows.

# Release Notes — v0.18.4.4

## Color Architecture & Page Composition

- Added large editorial title blocks for Dashboard, Team and Shift Execution.
- Integrated the Team action into the neon title composition.
- Changed Team summary cards from one repeated neon treatment to neon, pink and blue.
- Changed the Team filter surface to orange and varied employee-card colours while keeping employee identity consistent.
- Rebuilt Shift Plan composition around a pink title block, orange period controls and neon/orange calendar surfaces.
- Removed grey/white schedule surfaces and legacy status colouring.
- Replaced beige outlined Dashboard panels with pink, orange, neon and blue functional sections.
- Rebuilt Quick Actions as compact coloured actions instead of outlined cards inside an outlined container.
- Applied blue and neon functional sections to Shift Execution.
- Preserved all existing business logic, permissions, APIs, database behavior and workflows.

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
