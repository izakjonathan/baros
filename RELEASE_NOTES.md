# Bar Ops v0.10.5 — CSS Ownership Cleanup

Built directly from the uploaded v0.10.4 PWA baseline.

## Purpose

Remove historical CSS override layers and establish deterministic ownership without redesigning components or changing application functionality.

## Completed

- Removed the historical v0.9.6 and v0.9.7 redesign sections from `globals.css`.
- Reduced `!important` declarations from 227 to 0.
- Reduced repeated exact selectors in the same stylesheet/scope from 131 to 0.
- Consolidated the root token system from six base definitions to one.
- Made `mono-components.css` the canonical owner of `.topbar` and `.metric-card` appearance.
- Preserved genuine responsive variants.
- Added `npm run test:css-ownership` to prevent reintroduction of historical layers, duplicate exact selectors, multiple token roots, or `!important`.
- Updated CSS-aware tests to validate semantic rules rather than obsolete minified strings and release comments.
- Rotated the PWA service-worker cache namespace to v0.10.5.

See `CSS_OWNERSHIP_REPORT_V0105.md` for the detailed before/after audit.

## Database

No migration is required.
