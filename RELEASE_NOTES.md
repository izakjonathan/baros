# v0.19.0-rc.67 — Operation Quill Rich Text Editor

## Baseline

- Continued from v0.19.0-rc.66 after the full-screen Operation editor release. That release is the rollback checkpoint.

## Editor upgrade

- Replaced the temporary Operation block editor with direct Quill 2 rich text editing.
- Added a real rich text toolbar for title/H1/H2/body formatting, bold, italic, underline, strike, links, images, lists, alignment, colour, and clean formatting.
- Saved article body content as Quill Delta JSON in the existing Operation article content field.
- Rendered Quill Delta articles in the full-screen reader while preserving legacy block article rendering and conversion.
- Kept the full-screen editor shell, owner add buttons, metadata fields, and save validation flow from rc.66.

## Scope

Adds the exact `quill@2.0.3` dependency. No database-schema, route-shape, permission, or existing business-workflow changes are included. The change is limited to the standalone Operation module article editor and reader content rendering.

Rollback checkpoint: **v0.19.0-rc.66**.
