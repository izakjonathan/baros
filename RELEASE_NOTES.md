# Bar Ops v0.12.1 — Design-System Integrity Cleanup

This release audits and consolidates the v0.12.0 design implementation.

## Changes

- Removed 476 declarations in structural CSS that were contradicted by the canonical design system.
- Removed 152 internally superseded declarations and 39 empty duplicate rules.
- Removed obsolete `--mono-*` compatibility tokens that were no longer referenced anywhere.
- Reordered stylesheet loading so tokens load first, structural layout second, and the component design system last.
- Preserved feature geometry while removing duplicate visual ownership from structural CSS.
- Normalized and reformatted the structural stylesheet so future conflicts can be reviewed and changed safely.
- Added a design-integrity regression test covering stylesheet order, obsolete tokens, typography roles, spacing tokens, and cascade-forcing declarations.
- Updated the PWA cache namespace to v0.12.1.

No database migration is required.
