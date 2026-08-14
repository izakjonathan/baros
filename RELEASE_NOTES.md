# v0.19.0-rc.38 — CSS Architecture Reset

Baseline: **v0.19.0-rc.36** as a technical/functionality rollback checkpoint, not a visual baseline.

## Changes

- Rebuilt all application CSS from scratch.
- Reduced styling to three CSS files: global tokens, global application CSS, and Shift Plan custom CSS.
- Removed every other CSS Module and route-specific stylesheet.
- Removed compatibility layers and historical release-patch CSS.
- Rewired shared primitives and workspace class contracts to global styling.
- Preserved routes, APIs, permissions, database behavior, and operational workflows.
- Replaced CSS-era regression ownership checks with a current CSS architecture contract while retaining historical tests separately.

## Database
No migration required.
