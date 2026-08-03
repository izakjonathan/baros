# Implementation status — v0.17.0

## Completed in this release

- Explicit CSS layer order.
- Separate token, reset, transitional geometry and canonical component files.
- Removal of obsolete v0.16 compatibility stylesheets.
- Consolidation of historical repair blocks into component ownership.
- Removal of `!important` from canonical styling.
- Updated style-aware regression tests.
- New architecture integrity test included in `test:all`.

## Transitional work still remaining

`app/styles/legacy-geometry.css` remains a low-priority compatibility layer. It preserves feature geometry while modules are migrated. It must shrink release by release; new visual work must not be added there.

A full production build is run by GitHub Quality Checks. No database schema changes are included.
