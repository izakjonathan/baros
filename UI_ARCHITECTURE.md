# Bar Ops UI architecture — v0.17.0

The root layout imports one CSS entrypoint: `app/globals.css`.

That entrypoint declares the cascade order and imports four files:

1. `app/styles/tokens.css` — semantic fonts, colours, spacing, radii and dimensions.
2. `app/styles/reset.css` — browser reset and document/control inheritance.
3. `app/styles/legacy-geometry.css` — retained feature geometry in the low-priority `legacy` layer.
4. `app/styles/components.css` — canonical component appearance and responsive rules in the higher-priority `components` layer.

The declared order is:

```css
@layer reset, legacy, components;
```

Historical v0.15 and v0.16 repair sections were merged into their owning selectors in `components.css`. They are no longer separate late override blocks. `!important` is prohibited.

## Ownership policy

- Raw visual values belong in `tokens.css`.
- Browser defaults and inherited font behaviour belong in `reset.css`.
- Existing feature geometry that has not yet been migrated remains in `legacy-geometry.css`.
- Shared appearance and responsive presentation belong in `components.css`.
- React inline styles must not be used for normal presentation.

`legacy-geometry.css` is intentionally isolated and is the only transitional part of the architecture. Future feature work should migrate required geometry into feature-owned selectors in `components.css`, then delete the corresponding legacy rules.
