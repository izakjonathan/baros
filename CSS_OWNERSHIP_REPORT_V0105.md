# Bar Ops v0.10.5 — CSS Ownership Cleanup Report

## Scope

This release was built directly from the uploaded `bar-ops-v0.10.4-installable-pwa-ios-standalone(1).zip` baseline.

No React component, API route, database migration, application workflow, page structure, or feature behaviour was intentionally changed. The work was limited to stylesheet ownership, historical CSS removal, regression-test compatibility, package versioning, and the PWA cache namespace.

## Root cause

The v0.10.4 visual output depended on three accumulated styling generations:

1. the original structural and feature CSS in `app/globals.css`;
2. historical v0.9.6 and v0.9.7 redesign blocks appended to `globals.css`, using widespread `!important` declarations;
3. the later canonical Mono token and component styles.

The historical blocks repeatedly overrode both the original rules and the later component system. Exact selectors were also repeated within the same stylesheet and media-query scope. This made the final result dependent on source order and `!important` rather than clear component ownership.

## CSS changes

### `app/globals.css`

- Preserved the original structural and feature layout rules.
- Preserved the active v0.9.5 employee-portal implementation.
- Removed the complete historical `v0.9.6 borderless surface redesign` block.
- Removed the complete historical `v0.9.7 monochrome minimal flat redesign` block.
- Removed the duplicate root token block.
- Removed the old base `.topbar` and `.metric-card` appearance rules so those components have one canonical owner.
- Consolidated repeated exact selectors within each normal or responsive scope.
- Removed every `!important` declaration.

### `app/mono-tokens.css`

- Retained the existing Mono token system.
- Moved the remaining required legacy aliases into the single canonical root token rule:
  - `--accent-dark`
  - `--sidebar`
  - `--font-display`
  - `--focus-ring`
  - `--app-header-height`

### `app/mono-components.css`

- Kept this file as the canonical shared component-appearance owner.
- Consolidated repeated exact selectors within their matching media-query scope.
- Replaced release-number comments with functional section descriptions.
- Removed redundant base and tablet declarations for `--app-header-height` after moving the base value to the token file.
- Retained the genuine mobile `60px` header-height variant.
- Removed every `!important` declaration.

## Before and after

| Measure | v0.10.4 | v0.10.5 |
|---|---:|---:|
| CSS rules | 1,323 | 1,068 |
| CSS declarations | 3,742 | 3,341 |
| `!important` declarations | 227 | 0 |
| Repeated exact selectors in the same stylesheet/scope | 131 | 0 |
| Base `:root` token owners | 6 | 1 |

The cleanup removed 255 rules and 401 declarations without intentionally changing the rendered component structure.

## Canonical ownership after cleanup

- `app/mono-tokens.css` owns shared design variables.
- `app/globals.css` owns structural and feature-specific geometry.
- `app/mono-components.css` owns shared component appearance and interaction states.
- `.topbar` base positioning and appearance are owned by `app/mono-components.css`.
- `.metric-card` base appearance is owned by `app/mono-components.css`.
- Responsive variants remain separate only when the viewport genuinely changes the component.

## Regression checks

The release passed the complete bundled `npm run test:all` suite, including scheduling, payroll, PostgreSQL integrity, invitations, activation, employee access, location scoping, shift persistence, publishing, inventory, settings, time clock, PWA, responsive layout, Safari schedule controls, and the new CSS-ownership test.

Additional validation completed:

- all 66 TypeScript and TSX files transpiled successfully;
- all three CSS files parsed successfully;
- no `!important` declarations remain;
- no repeated exact selectors remain within the same stylesheet and responsive scope;
- historical v0.9.6/v0.9.7 redesign blocks are absent;
- only one base root token rule remains.

## Test-file changes

Historical tests previously required exact minified strings, old release comments, and `!important`. They were updated only so they validate the current semantic outcome and tolerate normal CSS formatting. Feature expectations were not removed.

## Not verified in this environment

A complete Next.js production build and real browser screenshot comparison could not be run because project dependencies are not installed in this workspace. Vercel and GitHub Quality Checks remain the final compilation checks.

Although the cleanup preserves final declaration values for repeated exact selectors, a browser-level visual comparison is still required before this release should replace v0.10.4 as the approved visual baseline.
