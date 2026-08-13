# Bar Ops v0.19.0-rc.21 — Design-System Micro-Audit

Current release: **v0.19.0-rc.21**

This release begins the site-wide micro-design refinement without changing the established visual direction. The audit found extensive low-level UI variation across the current CSS: 162 distinct font-size values, 15 font-weight values, 90 border-radius values, and more than 130 min-height values.

Rather than mass-rewriting pages, rc.20 establishes canonical typography and control geometry roles and migrates the genuinely shared control primitives first. This creates a safe target for subsequent workspace-by-workspace cleanup and avoids adding another override layer.

## Scope
- Site-wide micro-design audit of typography, button/control sizing, form fields, radii and spacing.
- Canonical small-UI typography roles and compact/default/large control geometry tokens.
- Shared Button primitive migrated to the new control roles.
- Shared native date/time field migrated to the new label/control roles while preserving intrinsic iOS sizing safety.
- Employee form labels, inputs and general action buttons migrated to the same shared roles.
- Existing 34px Employee Schedule compact action contract preserved.
- No API, database, permission or workflow changes.
- No migration required.

## Validation
The complete current regression chain, focused rc.20 design-system contract, release validation and release artifact audit pass.

## Rollback checkpoint
If rc.20 introduces an unexpected UI regression, roll back to v0.19.0-rc.19. rc.20 contains no database migration or data-model change.
