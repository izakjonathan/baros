# v0.19.0-rc.97 — Operations image performance

## Baseline

- Continued from v0.19.0-rc.96. That release is the rollback checkpoint.

## Included

- Uploads now generate a compact WebP preview and a detailed WebP image from one selected photo.
- Photos use a 1600px / 0.78 quality detailed target; PNG screenshots use 2048px / 0.84 to preserve small text. Inline previews are 960px.
- Reader images open the detailed version only after tap. Both files remain in the existing private, organization-scoped delivery route.
- Private image responses may be held in the user's browser cache for one hour; image paths are random and immutable.

No database migration is required.

Rollback checkpoint: **v0.19.0-rc.96**.
