# Bar Ops v0.9.9 — Mono Architecture & Release Integrity

This release hardens Bar Ops Mono after the v0.9.8 release audit.

## Design architecture
- Replaced the single high-specificity `mono.css` override layer with `mono-tokens.css` and `mono-components.css`.
- Removed all `!important` declarations from the Mono component layer.
- Removed the global `svg` rule and scoped icon treatment to Lucide/application icon contexts.
- Added explicit selected, pressed, disabled, loading and focus states.
- Restored 44px minimum mobile control height.
- Retained structural separators only for tables, settings rows and calendar columns.

## Release integrity
- Restored `.github/workflows/database-admin.yml` and `.github/workflows/quality.yml`.
- Quality checks now run regression tests, lint, type-check and production build.
- Added `test:mono-architecture` to prevent regression to the v0.9.8 override architecture.

## Database
No migration is required.
