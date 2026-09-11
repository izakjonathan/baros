# v0.19.0-rc.66 — Operation Full-Screen Article Editor

## Baseline

- Continued from v0.19.0-rc.65 after the ordered content block editor release. That release is the rollback checkpoint.

## Editor upgrade

- Replaced the inline owner article form with a full-screen editor window.
- Added dedicated Add handbook article and Add news buttons that open the full editor directly.
- Preserved ordered article blocks for title, heading, subheading, body, bullet list, numbered list, and image placement.
- Moved save and close controls into the editor chrome and kept validation/API messages visible when saving fails.
- Added a fixed bottom format bar so content block tools stay available while writing.

## Scope

No dependency, database-schema, route-shape, permission, or existing business-workflow changes are included. The change is limited to the standalone Operation module article editor interface.

Rollback checkpoint: **v0.19.0-rc.65**.
