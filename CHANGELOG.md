# Changelog

## v0.19.0-rc.102

- Reflowed Today news cards so owner metadata/actions remain in a compact header and the published body receives the full card width.
- Increased card-body reading size slightly while retaining the separate compact heading, subheading, body and list roles. Editor typography is unchanged.

## v0.19.0-rc.101

- Reworked Today news cards to preserve a compact published hierarchy for headings, subheadings, body copy and lists without changing the editor typography.
- Added Apple Notes-style internal article links: type `>>`, choose any existing Handbook or News article, and the selected title becomes an in-app link.
- Linked articles open in a reader stack with a bottom circular Back control beside Close. Close always returns to the underlying Operations page.
- Replaced the completed task glyph in Home’s black next-action card with an unchecked box.

## v0.19.0-rc.100

- Restored owner-only Edit and Delete controls on Today news cards.
- Saved articles now update the local Operations state immediately; a background refresh no longer controls whether the saved News card appears.
- Added explicit save-failure feedback and guaranteed release of the save control after a network failure.

## v0.19.0-rc.99

- Expanded the Operations Today news feed so each card shows the published title and readable article body in place.
- Removed the three-item news limit. Multiple updates now remain in normal page flow and the page scrolls naturally.

## v0.19.0-rc.98

- Reworked authenticated Operations Home into a Today-first view: one priority-ranked next task, then compact direct Task and Needs shortcuts.
- Removed Home’s duplicate Tools cards and metric panel; the persistent top navigation remains the route to Handbook, Tasks and Needs.
- Preserved existing task completion, Needs ordering, owner controls and shared-link permissions.

## v0.19.0-rc.97

- Replaced the single 2048px image upload with an automatic two-version Operations image pipeline.
- Photos now create a 960px inline WebP preview and a 1600px detailed WebP image; PNG screenshots retain a 2048px detailed version for readable small text.
- Preview images open the detailed version only when tapped, preserving the existing private/shared-link access rules.
- Reduced the Operations server upload limit to Vercel's 4 MB-safe range and allow private browser caching for one hour.

## v0.19.0-rc.96

- Replaced the handbook/news-only public page with an unguessable shared staff Operations link.
- Shared links expose employee-level Home, Handbook, Tasks and Needs; they can complete shared tasks, tick shared checklists, create needed items and mark orders, while owner/manager actions remain unavailable.
- Added migration `022_operation_public_staff_link.sql`; its audit entries clearly record shared-link actions without inventing an employee identity.

## v0.19.0-rc.95

- Removed the final fixed Operation accent and success colors. Every Operations color now derives from the saved Canvas/Ink pair.
- Open public read-only Operations pages now refresh the same organization palette as authenticated Operations sessions.
- Added regression coverage covering cards, controls, task/Needs views, reader, editor, popovers, UI Studio and safe-area canvas.

## v0.19.0-rc.94

- Added an owner-only UI Studio directly to Operation. It persists each organization’s canvas and ink colors, applies them to Operation, its editor and reader, and keeps the shared manager, employee, scheduling and settings surfaces unchanged.
- Added the read-only `/operation/public/<organization-slug>` route for published handbook and news. It excludes Tasks, Needs, editing and owner controls; published article images are readable only when their image path is referenced by published content.
- Switched the shared display and body family to Google Work Sans through `next/font/google`.
- Kept iPad-safe 16px touch input sizing and visual-viewport-aware editor controls. The production build now verifies that database-only theme access cannot enter the Operations browser bundle.
- Added `020_organization_ui_theme.sql`; apply it before enabling persisted color changes in production.

## v0.19.0-rc.89

- Removed the duplicate Owner articles panel. Owners now receive Edit and Delete controls on the ordinary Handbook article cards; other roles receive only the normal reader action.
- Fixed private article-image persistence by allowing the app’s authenticated image-delivery route in the constrained Tiptap schema.
- Resize compatible device photos in-browser to WebP (maximum 2048px, quality 0.82) before upload; GIFs remain unchanged.
- Made Vercel Blob failures actionable and restored the valid RC88 package lock after the published lockfile was found malformed.

## v0.19.0-rc.88

- Removed inherited full-size control padding from the article title and description fields, then tightened the editor canvas spacing between the header, title, description and article body.
- Moved the borderless formatting controls closer to the bottom of the live visual viewport, keeping a deliberate small gap above Safari browser chrome.

## v0.19.0-rc.87

- Reduced the visual size of the Handbook/News and category selectors without reducing the new-category text input below Safari’s no-zoom size.
- Renamed the category-menu action to “Add new category…” so the creation path is explicit.
- Removed the formatting dock’s enclosing border, fill, shadow and padding; only the formatting controls remain above the iOS browser chrome.

## v0.19.0-rc.86

- Compacted the Operation article-editor header into one row: smaller Back and Save controls, Handbook/News selector, and existing-category selector.
- Added an explicit New category path with a compact input, while preserving existing categories for reuse.
- Made the editing title use the same body-text scale and rhythm as article text; published article titles retain their reader styling.
- Left visual space between the format dock and Safari’s bottom browser chrome.
- Fixed image uploads for the connected private Vercel Blob store. Images are stored privately and served through an authenticated, organisation-scoped app route.
- Upgraded `@vercel/blob` to v2.3.0 for private-store reads.

## v0.19.0-rc.85

- Fixed daily-task creation when the optional short instruction is blank.
- Replaced the ambiguous task-assignment model with explicit audiences: a specific employee, everyone scheduled for that service date, or everyone regardless of scheduling.
- Added migration `019_operation_task_assignment_scope.sql`; existing individually assigned tasks remain individually assigned and all other existing tasks become Everyone.

## v0.19.0-rc.84

- Corrected task completion so it is recorded against the selected service date, including historical and future task views.
- Aligned task configuration and deletion with the shared `operations.manage` capability; handbook/news remain OWNER/ADMIN managed.
- Added authoritative refresh/error recovery for task, checklist, article-delete and Needs-order mutations.
- Made Operation service dates explicitly Copenhagen-based and made monthly/yearly recurrence use the last valid day of shorter months.
- Removed unshipped handbook governance, reminder and audit-history schema through migration `018_operation_integrity_cleanup.sql`.
- Rejected SVG image uploads and added Operation integrity regression coverage.

## v0.19.0-rc.74

- Kept the article editor full-screen while the keyboard is open; only the formatting dock now moves, preventing the Operation page from showing behind the editor.

## v0.19.0-rc.73

- Made the Operation article editor react to the mobile visual viewport so its toolbar floats above the iPhone keyboard.
- Replaced the horizontal Heading selector with a fixed-width Style menu that opens above the toolbar with Heading, Subheading, and Body options.

## v0.19.0-rc.72

- Restyled the full-screen Quill editor in the same cream/charcoal field-notes palette as the Operation page, with visible Heading, Subheading, and Body controls.
- Replaced image URL prompts with an authenticated device image upload flow backed by Vercel Blob (up to 8 MB per image).
- Replaced the large owner article buttons with circular plus actions in the News and Handbook headers.
- Added date-specific tasks and repeat settings: one-off, daily, weekly, monthly, yearly, interval, and optional end date.
- Added migration `015_operation_task_schedule.sql`; production must run it before the new task schedule fields can be used.

## v0.19.0-rc.71

- Restyled the standalone Operation module into a compact field-notes direction with a narrower content column, smaller section labels, tighter cards, thinner rows, and reduced control scale.
- Kept the Apple Notes-style full-screen dark article editor and Quill rich-text workflow intact.
- Preserved the existing `/operation` route, database/API behavior, permissions, and article/task/needs workflows.
- No database-schema, dependency-version, route-shape, authorization, or business-workflow changes.

## v0.19.0-rc.70

- Hardened Operation article parsing so saved content can render from block arrays, raw Quill Delta objects, or stringified JSON payloads.
- Added a non-empty article-reader fallback using the article title and description when saved content is missing or malformed.
- Made rich-text H1/H2 rendering tolerant of numeric or string Quill header attributes.
- Added API/UI contract coverage for tolerant rich-text parsing and non-empty article readers.
- No database-schema, dependency-version, route-shape, authorization, permission, or visual redesign changes.

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
