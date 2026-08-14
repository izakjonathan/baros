# v0.19.0-rc.43 — Repository Consolidation, Fixed Topbar & Shift Plan Scroll Containment

Baseline: **v0.19.0-rc.42**. **v0.19.0-rc.36** remains the technical/functionality rollback checkpoint.

## What changed

### Repository and test consolidation

- Removed the historical release-specific test-script archive from the active release package.
- Reduced `scripts/` from 200 `.mjs` files to 26 active scripts.
- Reduced npm scripts from 208 commands to 25 current commands.
- Removed `test:historical`; previous ZIP releases and Git history remain the historical record.
- Preserved the current business, payroll, integrity, production, inventory, remediation, authentication, tenant, transaction, API-boundary, type-safety, release-contract and CSS/UI gates.
- Simplified the GitHub quality workflow so it runs the current regression suite instead of two obsolete release-specific acceptance commands plus the current suite.
- Removed generated `tsconfig.tsbuildinfo` from the release package.

### Fixed shared top navigation

- The shared `WorkspaceTopbar` remains the single topbar component for Owner, Admin, Manager, Shift Manager and Employee.
- `.topbar` is now fixed at all viewport widths; mobile no longer switches it to `position: sticky`.
- `.main-shell` reserves the shared topbar height plus the device top safe area so content cannot slide underneath the fixed bar.
- Mobile topbar left/right padding uses the same global mobile gutter and safe-area ownership as page content.

### Shift Plan horizontal-scroll containment

- Shift Plan workspace now clips page-level inline overflow.
- The schedule panel is explicitly constrained to the workspace width.
- `.calendarScroll` is the sole horizontal-scrolling owner for the day columns.
- The wide seven-day grid remains horizontally scrollable without allowing the entire workspace/page to pan sideways.

## CSS architecture

Still exactly three CSS files:

1. `styles/tokens.css`
2. `app/globals.css`
3. `features/scheduling/ScheduleWorkspace.module.css`

No new stylesheet, wrapper or compatibility layer was introduced.

No database migration is required.
