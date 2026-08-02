# Bar Ops v0.10.6 — Code & Design-System Consolidation

This release is a code-architecture cleanup built on v0.10.5. It does not add a database migration.

## Design-system consolidation

- Replaced `mono-tokens.css` and `mono-components.css` with the canonical files:
  - `app/design-tokens.css`
  - `app/design-system.css`
- Centralized colour, typography, spacing, radius, control, icon, transition and app-shell values.
- Kept compatibility aliases so existing feature layouts can migrate gradually without visual regressions.
- Removed the legacy `:root` token block from `globals.css`.
- Removed all `!important` declarations from application CSS.
- Removed superseded v0.9.6 and v0.9.7 visual override layers from `globals.css`.
- Removed duplicate declarations where a later identical selector already supplied the final value.
- Fixed the malformed opening comment that previously swallowed the first design-system rule.
- Removed an undefined legacy focus token.

## CSS responsibilities

- `design-tokens.css`: the only source of global visual constants.
- `design-system.css`: shared component appearance and cross-feature responsive behavior.
- `globals.css`: structural and feature-specific layout only.

## Regression-suite cleanup

Historical tests now check current semantic outcomes instead of requiring old filenames, `!important`, or obsolete release-comment strings.

Added `npm run test:design-system` to prevent the architecture from drifting back toward competing token roots and override layers.

## PWA

- Rotated the service-worker cache namespace to v0.10.6.
- Retained standalone iPhone/iPad behavior and secure API cache exclusions.

## Validation

- Full `npm run test:all` passed.
- CSS parsed without syntax errors.
- All JavaScript test and service-worker files passed syntax validation.
- Both GitHub Actions workflows remain included.
- ZIP integrity and duplicate-entry checks passed.
