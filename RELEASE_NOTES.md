# v0.18.5.2 — iPhone Date Input Containment Fix

- Corrected the root cause of paired native date inputs overflowing the Time & Attendance filter card on iPhone Safari.
- Changed the date grid to shrinkable `minmax(0, 1fr)` tracks.
- Made labels and native date controls explicitly shrinkable through the full sizing chain.
- Added WebKit-specific date value/edit containment rules.
- Added permanent project guidance and a regression test so the issue is not reintroduced.
- No payroll logic, date values, filtering behavior, APIs, permissions, or persistence changed.

---

# v0.18.5.1 — Time & Attendance Mobile Density Pass

- Reduced the payroll header height and shortened supporting copy.
- Placed Lock, Approve and Export in one compact iPhone action row.
- Reduced filter-card padding, field heights and Reset prominence.
- Moved the Timesheets section ahead of summary cards so review records and empty states appear sooner.
- Compressed timesheet cards, payroll summaries, previews and empty states without changing payroll logic.
- Preserved calculations, filters, approvals, exports, permissions, APIs and persistence.

---

# v0.18.5 — Time & Attendance Redesign

- Rebuilt Time & Attendance around iPhone-first payroll review cards rather than a compressed desktop table.
- Made timesheet review the primary surface, with lock, approval, and export actions secondary.
- Consolidated period, employee, and status filters into a compact mobile filter panel.
- Replaced oversized metric cards with a compact four-part payroll summary.
- Added readable per-timesheet cards with scheduled, worked, break, variance, status, and contextual actions.
- Reduced payroll preview to relevant employees in the selected period.
- Preserved payroll calculations, filtering, correction, approval, export, API, permission, and persistence behavior.

---

# v0.18.4.30 — Shift Plan Divider & Density Cleanup

- Removed the remaining beige and grey divider rules around the schedule overview.
- Reduced spacing between adjacent mobile day columns.
- Reduced vertical spacing between shift cards and the icon-only add control.
- Shortened day/date headers and reduced their mobile typography.
- Preserved the calendar-first hierarchy and existing scheduling behaviour.

---

# v0.18.4.29 — Shift Plan Chrome Reduction

- Shortened day headers to one line with regular day names and bold dates.
- Removed decorative schedule dividers and the bottom role-status legend.
- Abbreviated month names in the period control.
- Moved the Week/Month/Period selector into the beige period-control pill.
- Removed schedule acknowledgement controls from the Shift Plan screen.
- Changed the global Add shift icon to black.
- Reduced employee-name sizing on mobile shift cards.
- Tightened horizontal spacing between day columns.
- Replaced per-day Add shift labels with icon-only controls and accessible labels.
- Preserved scheduling behavior, publishing, conflicts, drag-and-drop, APIs and persistence.

---

# v0.18.4.28 — iPhone-first Shift Plan

- Reworked the weekly rota around an exact three-day iPhone viewport.
- Increased touch targets while keeping controls visually secondary.
- Removed shift-card truncation by simplifying mobile card details and hiding redundant overnight copy when +1 is already shown.
- Made each day header, shift stack and Add shift action align to the same mobile column width.
- Preserved horizontal snap scrolling, role colors, drag-and-drop and scheduling behavior.

---

# v0.18.4.27 — Calendar-First Shift Plan

- Replaced the large pink title card with a lightweight title treatment on the black page background.
- Compressed view, copy and Add shift controls into a small secondary action group.
- Reduced the week navigation and publishing controls to a single compact toolbar.
- Made the weekly calendar the first dominant colored region on the screen.
- Standardized independently scrolling day columns with snap alignment.
- Preserved neon day headers, role-colored shift cards and per-day Add shift actions.
- Kept the legend compact and secondary below the calendar.
- Preserved scheduling workflows, drag-and-drop, recurrence, permissions, APIs and persistence.

---

# v0.18.4.26 — Balanced Shift Plan Rhythm

- Restored moderate spacing between major Shift Plan sections after the previous over-compression.
- Increased pink title-card padding and control breathing room without returning to the oversized layout.
- Slightly increased the beige week-toolbar height and control sizing.
- Added consistent spacing between day headers, shifts, Add shift actions and the legend.
- Removed the legend divider while preserving the content-driven schedule height.
- Preserved independent day columns, role colors, interactions and scheduling logic.

---

# v0.18.4.25 — Shift Plan Vertical Compression

- Reduced the pink Shift Plan header height and moved its content into a compact centered row.
- Reduced the beige week-navigation card height and control sizing.
- Forced the schedule grid to size to its actual content rather than viewport height.
- Removed duplicated legend divider behavior and moved the legend directly below the schedule.
- Preserved independent day columns, role colors, interactions, and scheduling logic.

---

# v0.18.4.24 — Compact Shift Plan Header Stack

- Reduced mobile top-bar height and control sizing.
- Reduced the pink Shift Plan card padding, title size and action-control height.
- Reduced the beige week-navigation card height and button sizing.
- Reduced vertical gaps before the day-header row so the schedule begins higher on mobile.
- Preserved independent day columns, neon day headers, role-colored shifts and scheduling behavior.

---

# v0.18.4.23 — Independent Day Column Repair

- Rebuilt the weekly schedule row as independent fixed-width day columns.
- Kept each neon header, shift stack, and Add shift action inside its own contained column.
- Prevented shift cards and actions from merging or clipping into neighboring days.
- Hid the intrusive horizontal scrollbar while preserving touch scrolling.
- Normalized role-card colors and moved the legend closer to schedule content.
- Preserved scheduling logic, drag-and-drop, recurrence, permissions, APIs, and persistence.

---

# v0.18.4.22 — Schedule Column & Shift Modal Polish

- Separated neon day headers with a visible black gap between every schedule column.
- Constrained shift cards and add-shift controls to their own day columns to eliminate overlap and clipping.
- Removed residual fixed schedule height and moved the legend directly beneath the content-driven grid.
- Tightened the week toolbar and normalized legend colours with role treatments.
- Reworked add/edit shift dialogs around internal scrolling, contained field widths and smaller balanced actions.
- Preserved scheduling logic, recurrence, permissions, APIs and persistence.

---

# v0.18.4.21 — Schedule Grid Alignment Repair

- Added one canonical schedule column-width token for headers and day bodies.
- Reset horizontal scroll to the first day whenever the displayed period changes.
- Overrode legacy fixed-width and viewport-height schedule rules that caused clipped headers and excessive empty space.
- Kept every day/date header neon, separate and rounded.
- Aligned shift cards and Add shift controls within their day columns.

---

# v0.18.4.20 — Day-header fill fix

- Fixed the Shift Plan day/date headers so every header cell uses the neon fill color.
- Removed the broken undefined CSS variable that left non-current day headers transparent.
- Preserved separate rounded header tiles, black schedule body background, compact shift cards and role-based colors.
- No workflow, data, API or permissions behavior changed.

---

# v0.18.4.19 — Shift-plan neon header fill polish

- Updated week/day header cells to use the neon fill color consistently.
- Kept the schedule body on the black site background while preserving separated rounded header cards.
- Reduced shift-card size and text density further for a lighter weekly overview.
- Preserved role-based shift colors and add-shift indicators.

---

# Release Notes — v0.18.4.18

## Shift Plan Density & Header Refinement

- Reduced the Shift Plan title block and control heights.
- Simplified the week toolbar into a slimmer beige control row.
- Reduced day-header padding, typography and corner radius.
- Reduced the mobile calendar minimum width and inter-column gaps.
- Reduced shift-card width, padding, typography, icon size and radius.
- Reduced the inline Add Shift indicator without removing its accessible button behaviour.
- Preserved role colours, first-name display, black schedule canvas and repaired shift dialogs.
- Preserved scheduling logic, recurrence, permissions, persistence and horizontal week scrolling.

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
