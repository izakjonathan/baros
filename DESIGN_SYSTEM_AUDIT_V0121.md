# Design-system audit — v0.12.1

The design code now has three explicit responsibilities:

1. `app/design-tokens.css` — the only source of visual constants.
2. `app/globals.css` — feature geometry and structural layout only.
3. `app/design-system.css` — shared component appearance, typography, state and responsive presentation.

The cleanup removed property-level conflicts where structural CSS assigned a value that the canonical design system later replaced for the same selector and responsive context. It also removed earlier duplicate declarations inside each stylesheet when a later declaration for the exact selector and context made the earlier value unreachable.

The remaining repeated selectors are intentional responsive or component-state extensions, not duplicate property ownership. No `!important` declarations or global SVG mutations are present. Space Grotesk remains limited to display-level page/dialog titles; Inter remains the interface and content family.
