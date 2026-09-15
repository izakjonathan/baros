# v0.19.0-rc.89 — Handbook owner actions and image reliability

## Baseline

- Continued from v0.19.0-rc.88. That release is the rollback checkpoint.

## Included

- Moved owner Edit and Delete actions into the existing Handbook cards and removed the duplicate owner-only article list.
- Fixed the mismatch that discarded successfully uploaded private images when the article was saved.
- Resize compatible device photos before upload, retaining a 2048px maximum dimension and WebP quality 0.82.
- Return an actionable storage message when Vercel Blob cannot save an image.
- Restored a valid package lock from the verified RC88 baseline.

No database migration is required.

Rollback checkpoint: **v0.19.0-rc.88**.
