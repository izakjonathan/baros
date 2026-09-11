# v0.19.0-rc.65 — Operation Notes-Style Article Editor

## Baseline

- Continued from v0.19.0-rc.64 after the owner Operation access fix. That release is the rollback checkpoint.

## Editor upgrade

- Replaced the basic article textarea with an ordered Notes-style block editor for OWNER and ADMIN users.
- Added insertable text, heading, subheading, bullet list, numbered list, and image blocks.
- Added block move/remove controls so formatted text and images can be arranged where they belong inside the article.
- Added visible editor feedback for missing title, missing description, missing content, and API save failures.

## Scope

No dependency, database-schema, route-shape, permission, or existing business-workflow changes are included. The change is limited to the standalone Operation module article editor.

Rollback checkpoint: **v0.19.0-rc.64**.
