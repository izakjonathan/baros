# Changelog

## v0.19.0-rc.55

- Removed four disconnected UI primitive files, the unused shared `EmptyState`, an obsolete static day fixture, an unused warning logger, and the corresponding unreferenced global selector.
- Made 17 implementation-only types, constants, helpers, and error classes module-private instead of exposing them as unsupported cross-module contracts.
- Added a general runtime reachability check to the existing UI contract so disconnected modules under `components`, `features`, or `lib` fail the active regression suite.
- Preserved the three-file CSS architecture; no stylesheet owner, dependency, database schema, API contract, authorization rule, permission, rendered layout, or business workflow changed.

## v0.19.0-rc.54

- Added the verified npm lockfile generated with Node 24.19.0 and npm 10.9.2 from the existing exact dependency declarations.
- Changed the quality workflow from mutable `npm install` resolution to cached, lockfile-backed `npm ci` after activating the declared npm version through Corepack.
- Repaired the existing ESLint flat-config compatibility with the pinned ESLint version and accepted Next.js's current generated-type include contract.
- Cleared every repository ESLint error and warning at source: database results and persistence boundaries are explicitly typed, unknown failures are narrowed safely, effect-driven external loads are cancellable, and unused state/props are removed.
- Completed the condensed React/Next quality review after the TSX repairs without adding components, styles, or alternate behavior owners.
- Strengthened the existing artifact, preflight, release, and release-contract checks around the package manager and lockfile contract.
- Updated the current baseline documentation from the historical rc.1 reference to the user-confirmed rc.53 deployment.
- No CSS, dependency-version, database-schema, API-contract, authorization, permission, layout, visual, or business-behaviour changes.

## v0.19.0-rc.53

- Replaced build-time Google font downloads with repository-owned local variable Inter and Space Grotesk assets through `next/font/local`.
- Preserved the existing font families, CSS variables, design weights, and extended-Latin character coverage without changing CSS.
- Added the upstream SIL Open Font License notices beside the bundled font assets.
- Strengthened the existing UI contract so Google font imports cannot silently restore a network-dependent production build.
- No database, API, authorization, permission, layout, or business-behaviour changes.

## v0.19.0-rc.52

- Corrected the Shift Plan document-width leak by giving shared page/workspace grids explicit zero-minimum tracks.
- Replaced page-level horizontal overflow containers with non-scrollable clipping while preserving touch scrolling on the calendar scroller.
- Replaced Schedule's responsive bare `1fr` tracks with `minmax(0, 1fr)` tracks so controls cannot contribute intrinsic width to the page.
- Strengthened the existing UI contract around the complete overflow ownership chain instead of adding a release-specific test.
- No database, API, authorization, permission, visual-direction, or business-behaviour changes.

## v0.19.0-rc.51

- Moved the remaining Attendance, Team, Inventory, and Orders dialog implementations from the manager orchestrator into their existing feature owners.
- Kept dialog state, persistence, notifications, and cross-feature coordination in the orchestrator while removing its direct shared-dialog, icon, and dialog-style dependencies.
- Generalized the existing UI contract to protect feature ownership for all seven extracted dialogs.
- Reduced `components/bar-ops-app.tsx` from 37,330 bytes to 26,765 bytes without adding files or changing CSS.
- No database, API, authorization, permission, visual, or business-behaviour changes.

## v0.19.0-rc.50

- Fixed the Vercel TypeScript failure by restoring the missing Lucide `History` runtime import in `AttendanceWorkspace`.
- Extended the existing UI contract to detect capitalized JSX components that are rendered without a runtime import or local binding.
- Moved add/edit Shift Plan dialogs from the manager orchestrator into scheduling feature ownership.
- Removed local Sidebar, Topbar, Modal, and ModalActions forwarding adapters in favour of the existing shared components.
- Removed decomposition-era dead imports, two orphaned Attendance helpers from Shift Plan, an unused login router, and one dead orchestrator formatter.
- No CSS, database, API, authorization, permission, or business-behaviour changes.

## v0.19.0-rc.49

- Repaired all unresolved feature dependencies left by the rc.45 source decomposition by importing existing shared helpers, class contracts, data constants, and icons into their feature owners.
- Removed eight redundant local `PageHeader` adapters and now use the shared `WorkspaceHeader` directly.
- Consolidated four duplicate `PanelTitle` implementations into `components/ui/workspace-ui.tsx`.
- Removed the stray `defaultClockSettings` declaration from Team and placed the settings default with the Settings feature that owns it.
- No CSS, database, API, authorization, or business-behaviour changes.

## v0.19.0-rc.48

- Fixed `WorkspaceHeader` prop wiring in all feature-owned workspace adapters after the rc.45 decomposition.
- Replaced stale `subtitle`/`action` props with the shared header contract `description`/`actions`.
- Added a regression scan for stale `WorkspaceHeader` adapter props.

## v0.19.0-rc.47

- Fixed the stale `<Team>` render reference left by the rc.45 source decomposition; the orchestrator now renders `TeamWorkspace`.
- Added stale decomposed-workspace wiring coverage to the existing UI contract.
- No CSS, database, API, permission, or workflow changes.

## v0.19.0-rc.46

- Contained Shift Plan horizontal scrolling to the day-grid scroller on Safari/iPhone.
- Added inline-size containment so the wide week grid cannot widen the document.
- Kept the shared top navbar fixed site-wide.

## v0.19.0-rc.44

- Consolidated active version-numbered regression scripts into semantic auth, API-integrity, release, and UI contract tests.
- Reduced active `scripts/*.mjs` from 26 to 17 and total packaged files from 179 to 169.
- Updated stabilization preflight and npm commands to use semantic current-contract tests.
- Removed completed `docs/plans/css-reset-validation.md`.
- No application, CSS, database, permission, or workflow behavior changed.

## v0.19.0-rc.43

- Consolidated the active repository from 200 historical `.mjs` scripts to 26 current scripts.
- Reduced npm command surface from 208 historical commands to 25 active commands.
- Removed generated `tsconfig.tsbuildinfo` from the release package.
- Made the shared top navigation fixed at every viewport width.
- Contained Shift Plan horizontal scrolling to the day-grid scroller instead of the whole page.

## v0.19.0-rc.42

- Reduced the global card system to standard, compact, and flush fundamentals only.
- Removed obsolete card state/muted/elevated/panel fundamentals and duplicated feature card geometry.
- Kept Shift Plan as the sole custom card-layout exception.
- Added governance requiring existing code to be changed/replaced/consolidated before new primitives are introduced where possible.

## v0.19.0-rc.41

- Repaired CSS/source ownership mismatches found by the full rc.40 audit.
- Standardized page gutters, safe areas, headers, Dialog body structure, shared states, and dark-only theme behavior.
- Moved Shift Plan editor-only layout rules into the Shift Plan CSS module.
- Reconciled runtime class contracts without restoring legacy CSS files.


## 0.19.0-rc.38

- Rebuilt the CSS architecture from scratch using rc.36 as the technical/functionality checkpoint.
- Reduced application styling to global tokens, global application CSS, and one Shift Plan CSS Module.
- Removed all other CSS Modules, route-specific CSS, compatibility layers, release patch stylesheets, and CSS release-history sections.
- Kept existing application routes, APIs, permissions, database behavior, and business workflows unchanged.
## v0.19.0-rc.45
- Decomposed manager workspace implementations into feature/domain modules; no behavior or CSS changes.
