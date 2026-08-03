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
