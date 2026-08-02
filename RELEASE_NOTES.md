# Bar Ops v0.9.7 — Monochrome Minimal Flat Redesign

This release deepens the v0.9.6 visual-system work across the complete manager and employee applications.

## Visual principles

- The application canvas is now a subtle neutral light grey (`#f3f4f6`).
- White surfaces are separated from the canvas through fill and spacing, not outlines.
- Decorative borders and divider rules have been removed across cards, panels, navigation, lists, forms and action groups.
- Only very subtle rules remain where they communicate real table or calendar structure.
- Interface icons use a single black-stroke, transparent-background treatment.
- Icon wrappers no longer use coloured tiles.
- Adjacent actions share a consistent 40px control height and compact spacing.
- Toolbar and inline actions use transparent flat controls with tonal hover and pressed feedback.
- Inputs use a soft tonal fill rather than a hard outline while retaining a visible focus ring.
- The manager and employee portals now use the same monochrome surface hierarchy.

## Accessibility retained

Invisible button chrome does not reduce the clickable area. Icon controls retain 40–44px targets and accessible labels. Focus states remain visible, semantic error/destructive colours remain available, and dense data structures retain subtle separators where needed.

No database migration is required.
