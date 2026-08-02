# Bar Ops Mono v0.10.0

Bar Ops Mono is a token-led monochrome interface. Hierarchy comes from tone, spacing, typography and state—not decorative borders or shadows.

## Source files
- `app/mono-tokens.css`: canonical neutral palette, radii, control sizes and compatibility aliases.
- `app/mono-components.css`: application-level surface, toolbar, form, schedule, employee and interaction primitives.

## Rules
1. Grey canvas, white surfaces, one inset grey.
2. No decorative border where tone or spacing already separates content.
3. Structural separators only for dense data and same-tone rows.
4. Black outline icons scoped to icon components; never mutate every SVG globally.
5. Minimum 44px interaction targets on touch devices.
6. Explicit selected, pressed, disabled, loading and focus-visible states.
7. One dominant primary action per context.
8. Semantic colour is reserved for danger, warning and success meaning.
