# Bar Ops v0.17.0 — Explicit Style Ownership

v0.17.0 replaces the v0.16.1 concatenated stylesheet with an explicit cascade architecture.

## Changes

- Added `app/styles/tokens.css`, `reset.css`, `legacy-geometry.css` and `components.css`.
- Reduced `app/globals.css` to a six-line CSS entrypoint with declared cascade-layer order.
- Removed the obsolete `app/design-tokens.css` and `app/interface-v016.css` files.
- Merged the embedded v0.15 repair section and v0.16 safeguards into their owning component selectors.
- Removed all `!important` declarations from the canonical component layer.
- Added a shared stylesheet reader for regression tests.
- Added `test:style-architecture` to catch missing files, obsolete style layers, undefined variables and cascade regressions.
- Updated active tests so they inspect the complete style architecture rather than obsolete filenames.

## Scope

This release completes the first structural stage of the design-system reconstruction. Existing feature geometry remains isolated in the low-priority `legacy` layer so working layouts are preserved while individual modules are migrated safely. It does not claim that every legacy rule has already been deleted.

No database migration is required.
