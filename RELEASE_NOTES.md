# v0.19.0-rc.101 — Readable News & Article Links

## Baseline

- Continued from v0.19.0-rc.100. That release is the rollback checkpoint.

## Included

- Today news uses a compact published-text renderer, retaining distinct heading, subheading, body and list roles inside each card without touching editor formatting.
- Typing `>>` in a Handbook or News article opens an article picker. A selection inserts its title as an in-app link.
- Reader links push the selected article onto a navigation stack. A circular back control appears beside Close only when there is a previous article.
- Home’s next task uses an unchecked box, matching its incomplete status.

No database migration is required. Owner, employee and shared-staff permissions remain unchanged; each sees only the articles their existing access grants.

Rollback checkpoint: **v0.19.0-rc.100**.
