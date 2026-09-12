# Changelog

## v0.19.0-rc.69

- Corrected the Operation Quill toolbar so rich-text headings are exposed as `H1`, `H2`, and `Body`.
- Rendered Quill rich-text header level 1 as `h1` and header level 2 as `h2` in article readers.
- Added UI-contract coverage for the exact H1/H2 rich-text toolbar and reader mapping.
- No database-schema, dependency-version, route-shape, authorization, permission, or visual redesign changes.

## v0.19.0-rc.68

- Made missing Operation database storage an explicit UI state instead of a silent save failure.
- Added mutation responses that return `503` and `x-operation-storage: migration-required` when the Operation migration has not been applied.
- Kept article, task, and needed-item drafts visible when a save fails, with visible status messages.
- Added API and UI contract coverage for Operation migration-required save failures.
- No database-schema, dependency-version, route-shape, authorization, permission, or visual redesign changes.

## v0.19.0-rc.67

- Replaced the Operation pseudo-block article editor with Quill 2 rich text editing.
- Added a Quill toolbar for title/H1/H2/body formatting, bold, italic, underline, strike, links, images, alignment, colour, bullets, numbered lists, and clean formatting.
- Saved article bodies as Quill Delta JSON inside the existing Operation article content JSON column.
- Added reader rendering for Quill Delta content while keeping legacy block-based articles readable.
- Added API parsing support and UI-contract coverage for rich text Delta content.
- No database-schema, route-shape, authorization, permission, or business-workflow changes.

## v0.19.0-rc.66

- Moved the Operation owner article form into a full-screen Notes-style editor window.
- Added dedicated Add handbook article and Add news buttons that open the editor directly.
- Kept ordered content blocks for title, heading, subheading, body, bullet list, numbered list, and images.
- Moved save/close actions into the full-screen editor and kept validation messages visible when saving fails.
- Added UI-contract coverage for the full-screen editor, fixed bottom format bar, and visible save feedback.
- No dependency-version, database-schema, route-shape, authorization, permission, or business-workflow changes.

## v0.19.0-rc.65

- Replaced the basic Operation article textarea with an ordered Notes-style block editor for OWNER/ADMIN users.
- Added insertable text, heading, subheading, bullet list, numbered list, and image blocks that can be placed in article order.
- Added block move/remove controls so images and formatted text can be arranged where needed.
- Fixed silent article-save failures by showing validation and API error messages in the editor.
- Added UI-contract coverage for the block editor and visible save feedback.
- No dependency-version, database-schema, route-shape, authorization, permission, or business-workflow changes.

## v0.19.0-rc.64

- Added an Operation entry to the owner/manager workspace navigation so the standalone Operation module is reachable after owner login.
- The Operation entry opens `/operation`, where OWNER and ADMIN users can access the Handbook and News editor.
- Kept the standalone Operation module outside the main side-menu shell.
- Added UI-contract coverage to prevent the owner workspace entry point from disappearing again.
- No dependency-version, database-schema, route-shape, authorization, permission, or business-workflow changes.

## v0.19.0-rc.63

- Removed the top-right Close button from fullscreen Operation article readers.
- Changed the bottom article close control to a centered outlined circle with no fill.
- Removed visible article-link CTA buttons from handbook/news articles.
- Removed Handbook category group headings so categories appear only as article-card pills.
- Tightened Operation typography across news, handbook, daily tasks, needs, cards, and reader views.
- Added UI-contract coverage for the reader close control, removed article-link buttons, and flat Handbook article list.
- No dependency-version, database-schema, route-shape, authorization, permission, or business-workflow changes.

## v0.19.0-rc.62

- Removed the Operation home intro title/copy block so News starts the module content directly.
- Removed the duplicate News submodule card because News already appears at the top of the Operation home screen.
- Removed the standalone page titles from Operation, Handbook, Daily Tasks, and We Need views.
- Fixed the Operation top navigation to the viewport and centered the nav items inside the pill.
- Reduced Operation section and category heading scale for a cleaner mobile interface.
- Added UI-contract coverage for the fixed centered nav and removed duplicate title/news card patterns.
- No dependency-version, database-schema, route-shape, authorization, permission, or business-workflow changes.

## v0.19.0-rc.61

- Removed the standalone Operation header label and Bar Ops pill from the Operation module.
- Removed arrow icons from Operation article cards and linked article buttons.
- Kept the compact segmented navigation, main Operation page title, article/category labels, module icons, and all workflows intact.
- Updated release metadata and documentation to identify v0.19.0-rc.60 as the rollback checkpoint.
- No dependency-version, database-schema, route-shape, authorization, permission, or existing business-workflow changes.

## v0.19.0-rc.60

- Refined the standalone Operation module UI into a smaller, more professional mobile interface.
- Reduced oversized hero/card typography, slimmed card borders, tightened spacing, and changed the header navigation into a compact segmented control.
- Kept the single-colour Operation design, standalone route, article reader, owner editor, Daily Tasks, and We Need workflows intact.
- Updated release metadata and documentation to identify v0.19.0-rc.59 as the rollback checkpoint.
- No dependency-version, database-schema, route-shape, authorization, permission, or existing business-workflow changes.

## v0.19.0-rc.59

- Added a production fallback so `/operation` opens with starter content instead of rendering the generic “Try again” error when the Operation database migration has not been applied yet.
- Added the same migration-required fallback to the Operation module GET API refresh path.
- Extended the API-integrity contract to keep the Operation migration fallback in place.
- Updated release metadata and documentation to identify v0.19.0-rc.58 as the rollback checkpoint.
- No CSS, dependency-version, route-shape, authorization, permission, layout, visual, or existing business-workflow changes.

## v0.19.0-rc.58

- Added a standalone `/operation` module with no inherited side menu, its own header navigation, and a single-colour mobile-first design.
- Added Handbook, News, Daily Tasks, and We Need submodules with bordered card presentation inspired by the supplied mobile reference.
- Added full-screen handbook/news article reading with formatted content blocks, linked-article navigation, back handling, and bottom-centred circular close control.
- Added owner/admin content editing for handbook/news articles and owner/admin creation of day-specific daily tasks.
- Added employee task completion and shared “We need” ordering-list workflows backed by a new operation module migration and API.
- Updated employee home to expose the new Operation module.
- Documented Operation as the explicit second CSS Module exception alongside Shift Plan.

## v0.19.0-rc.57

- Completed the remaining request-context cleanup by correcting all four operation-checklist catch paths missed by the rc.56 variable-name-specific contract.
- Generalized API-integrity coverage so every single-argument `jsonError(...)` call is rejected regardless of catch-variable name.
- Removed the unreachable UI primitive directory, the unused shared `EmptyState`, its dead CSS selector, and legacy class hooks that had no CSS owner or runtime consumer.
- Enabled TypeScript unused-local and unused-parameter checks as permanent compiler gates and extended UI-contract coverage for the removed source surface.
- Updated release metadata and documentation to identify v0.19.0-rc.56 as the rollback checkpoint.
- No dependency-version, database-schema, route-shape, authorization, permission, layout, visual, or business-behaviour changes.

## v0.19.0-rc.56

- Preserved request context in API error responses by passing the incoming `Request` to `jsonError` across API route catch paths.
- Extended the API-integrity contract to reject route handlers that drop request context with bare `jsonError(error)` calls.
- Updated release metadata and documentation to identify v0.19.0-rc.55 as the rollback checkpoint.
- No CSS, dependency-version, database-schema, route shape, authorization, permission, layout, visual, or business-behaviour changes.

## v0.19.0-rc.55

- Removed the unused server warning logger and stopped exporting helpers that are only consumed within their defining modules.
- Removed the unused schedule-day fixture constant from the shared demo data module.
- Added UI-contract coverage to keep same-file-only helpers from returning to the public module surface.
- Updated release metadata and documentation to identify v0.19.0-rc.54 as the rollback checkpoint.
- No CSS, dependency-version, database-schema, API-contract, authorization, permission, layout, visual, or business-behaviour changes.

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
