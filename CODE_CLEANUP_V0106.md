# v0.10.6 code cleanup summary

## Removed

- Superseded `app/mono-tokens.css`
- Superseded `app/mono-components.css`
- Legacy global `:root` design values in `globals.css`
- All CSS `!important` declarations
- Old v0.9.6 and v0.9.7 visual override sections
- Duplicate same-selector declarations superseded later in the same cascade context
- Undefined `--mono-focus` usage
- Release-number-dependent CSS comments used as test hooks

## Added

- `app/design-tokens.css`
- `app/design-system.css`
- Semantic tokens for colour, type, spacing, shape, controls, transitions and app-shell dimensions
- Compatibility aliases for gradual feature migration
- `scripts/test-design-system-v0106.mjs`
- Architecture rules in `BAR_OPS_MONO.md`

## Result

Central visual changes can now be made through semantic tokens without editing multiple competing `:root` blocks or fighting legacy `!important` declarations.
