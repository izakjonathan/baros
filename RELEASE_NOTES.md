# v0.19.0-rc.69 — Operation Rich Text Heading Controls

## Baseline

- Continued from v0.19.0-rc.68 after the Operation storage save-feedback release. That release is the rollback checkpoint.

## Heading controls

- Changed the Operation Quill dropdown from `Title / H1 / H2 / Body` to `H1 / H2 / Body`.
- Rendered Quill header level 1 as `h1` and header level 2 as `h2` in the full-screen article reader.
- Added UI-contract coverage for the H1/H2 toolbar and reader mapping.

## Scope

No database-schema, dependency-version, route-shape, permission, visual redesign, or existing business-workflow changes are included. The change is limited to Operation rich-text heading controls and article reader rendering.

Rollback checkpoint: **v0.19.0-rc.68**.
