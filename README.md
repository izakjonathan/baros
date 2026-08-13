# Bar Ops v0.19.0-rc.19 — Shift Action Height Root-Cause Fix

Current release: **v0.19.0-rc.19**

This release fixes the remaining Employee Schedule action-height inconsistency at the CSS ownership level. `Add shift note` was 34px because it matched `.secondary.compact`; `Hand over / swap` and `Request shift` remained 42px because the global `.portal-action` rule still owned their height.

The shared employee `.shift-card-action` rule now explicitly owns `height: 34px` and `min-height: 34px`, so all three schedule actions render with the same height regardless of their underlying base button class.

## Scope
- Employee Schedule action height only.
- No API changes.
- No database changes.
- No permission or workflow changes.
- No migration required.

## Validation
The focused rc.19 regression and the complete current regression chain pass. Dependency-backed Next.js build/TypeScript validation remains the Vercel build gate when dependencies are not installed locally.

## Rollback checkpoint
If rc.19 introduces an unexpected regression, roll back to the confirmed v0.19.0-rc.18 package. rc.19 contains no database migration or data-model change.
