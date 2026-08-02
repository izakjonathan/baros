# Bar Ops Product Design System — v0.12.1

Bar Ops uses two type families with strict roles: Space Grotesk for primary page and dialog titles, and Inter for every smaller interface style. `app/design-tokens.css` is the central source of truth; `app/design-system.css` contains shared product patterns.

# Bar Ops design system — v0.11.0

## Source of truth

1. `app/design-tokens.css` defines semantic values.
2. `components/ui-primitives.tsx` defines shared interactive controls.
3. `app/design-system.css` defines their visual and responsive behavior.
4. Feature CSS should only define domain-specific layout.

## Semantic rhythm tokens

- `--space-inline`
- `--space-field`
- `--space-card`
- `--space-section`
- `--space-page`

Changing these values realigns the product centrally.

## Canonical controls

Use `ActionButton`, `ActionGroup`, `InputField`, `SelectField`, `SegmentedControl`, `FilterBar`, `KpiCard`, and `DialogFooter`. Do not create new page-specific button, field, or footer systems when one of these applies.


## Role parity
All manager and employee-facing routes consume the same semantic design tokens and interaction primitives.
