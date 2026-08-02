# Bar Ops Mono — v0.10.5

Bar Ops Mono is the current visual system.

## Foundations

- Subtle light-grey application canvas
- White primary surfaces and one muted inset surface
- Near-black text and black-stroke Lucide icons
- No decorative borders or routine card shadows
- Minimum 44px interaction targets
- Tonal selected, pressed, disabled and focus states
- Semantic colour reserved for warning, success and destructive meaning

## CSS ownership

- `app/mono-tokens.css` defines design tokens.
- `app/mono-components.css` defines shared component and responsive treatments.
- `app/globals.css` retains feature layout and legacy structural rules pending gradual module extraction.

New visual work should extend shared tokens and primitives instead of adding page-specific override layers.
