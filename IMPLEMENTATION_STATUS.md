# Bar Ops implementation status — v0.13.2

All v0.13.1 database and application functionality is retained. v0.13.2 is a presentation and layout recovery release. It does not alter the PostgreSQL schema.

The active design architecture is:

1. `app/design-tokens.css` — all semantic constants.
2. `app/globals.css` — feature-specific structural geometry retained from the application.
3. `app/product-system.css` — canonical role-independent presentation and responsive layout.

The full bundled source regression suite passes, including the new layout-recovery checks.
