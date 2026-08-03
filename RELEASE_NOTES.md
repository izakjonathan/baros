# Bar Ops v0.10.6 — Targeted runtime and shell fixes

Built directly from the approved v0.10.5 CSS ownership cleanup release.

## Fixes

- Restored the owner top bar's canonical flex layout without reintroducing duplicate selectors or `!important`.
- Added an explicit owner-workspace Sign out action using the existing logout API.
- Employee My Hours now always exits its loading state when either request fails.
- Hours summary no longer fails when the optional correction-request table is unavailable; correction status falls back safely.

No unrelated components, layouts, design tokens, migrations, or workflows were changed.
