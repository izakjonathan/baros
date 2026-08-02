# Bar Ops design system — v0.10.6

Bar Ops uses a token-led, monochrome and flat interface. The design system is intentionally split by responsibility so central changes remain predictable.

## Canonical files

### `app/design-tokens.css`

This is the single source of truth for:

- colour roles,
- typography scale,
- spacing scale,
- radii,
- control and icon dimensions,
- focus and transition behavior,
- sidebar, header and content dimensions.

Make application-wide visual changes here first.

### `app/design-system.css`

This contains reusable visual behavior for:

- surfaces,
- buttons and icon actions,
- forms,
- status pills,
- navigation,
- cards,
- schedule controls,
- Team cards,
- employee portal components,
- responsive and standalone-PWA states.

It must consume semantic tokens and must not define a competing `:root` palette or use `!important`.

### `app/globals.css`

This contains structural and feature layout. It can define grids, positioning and feature-specific geometry, but must not become a second global design system.

## Rules

1. Do not add a new global colour or dimension directly to feature CSS when an existing semantic token fits.
2. Add new tokens only for reusable design decisions, not one-off fixes.
3. Do not use `!important`.
4. Do not add unscoped SVG rules.
5. Keep interaction targets at least `--control-height`.
6. Keep selected, disabled, loading, pressed and focus states visible.
7. Prefer removing obsolete declarations over appending another release-specific override section.
