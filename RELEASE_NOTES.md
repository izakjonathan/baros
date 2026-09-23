# v0.19.0-rc.122 — Mobile Dock Capsule

## Baseline

- Continued from v0.19.0-rc.121. That release is the rollback checkpoint.

## Included

- The mobile Operations dock and active destination now use true pill geometry.
- The fixed dock sits closer to Safari's URL bar while retaining Home Screen safe-area protection.
- Keyboard, article-reader, editor, and iPad rail behavior are unchanged.

No database migration is required. Permissions and navigation destinations are unchanged.

Rollback checkpoint: **v0.19.0-rc.121**.

# v0.19.0-rc.121 — Mobile News Card Typography

## Baseline

- Continued from v0.19.0-rc.120. That release is the rollback checkpoint.

## Included

- Home news body copy now uses a stable 16px regular weight instead of viewport-scaled semi-bold text.
- Headings, subheadings, paragraphs, and lists retain distinct roles with a calmer mobile reading rhythm and controlled line length.
- The article editor and full article reader remain unchanged.

No database migration is required. Permissions, workflows, and article content are unchanged.

Rollback checkpoint: **v0.19.0-rc.120**.

# v0.19.0-rc.104 — Installable Shared Staff Links

## Baseline

- Continued from v0.19.0-rc.103. That release is the rollback checkpoint.

## Included

- Each shared staff Operations URL now supplies its own web manifest, with the exact public URL as its Home Screen start target.
- The manifest is server-validated against the active access token and is returned with `no-store` caching, so a revoked link cannot continue to refresh its installation metadata.
- The global owner/employee manifest and all existing Operations permissions remain unchanged.

No database migration is required. Owner, employee and shared-staff permissions remain unchanged.

Rollback checkpoint: **v0.19.0-rc.103**.
