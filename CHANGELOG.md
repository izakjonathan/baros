# Changelog

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
