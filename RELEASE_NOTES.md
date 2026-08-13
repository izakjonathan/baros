# Bar Ops v0.19.0-rc.21 — Shared Interaction Micro-Refinement

## Baseline
- v0.19.0-rc.20

## Purpose
This is the first controlled migration release after the rc.20 design-system micro-audit. It reduces clunky control typography and geometry at the shared interaction layer instead of patching individual pages.

## Changes
- Migrated login/auth labels, inputs, primary action and error messaging to the canonical micro-design typography and control geometry.
- Migrated shared modal/dialog labels, inputs, selects, textareas and action buttons to the same canonical roles.
- Reduced dialog control border weight from the historical 2px treatment to the shared control-border token.
- Migrated top-bar search/notification popover controls to compact shared typography, padding and radii.
- Standardized workspace helper copy on the canonical helper-text role.
- Reduced shared empty/loading/error state bulk while keeping the same surfaces and visual direction.
- Preserved the rc.19 34px Employee Schedule action-height ownership fix.

## Deliberately unchanged
- Black canvas, pastel palette, card colour composition and top-bar/navigation direction.
- Feature-specific layouts and business workflows.
- APIs, permissions and database schema.

No database migration is required.
