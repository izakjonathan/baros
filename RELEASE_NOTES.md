# Bar Ops v0.9.6 — Borderless Surface Redesign

This release rebuilds the visual hierarchy across the manager and employee products around two rules:

1. Cards, buttons and panels placed on a contrasting surface no longer use decorative borders.
2. Top-navigation actions visually become icons on the navigation surface, without separate button fill or outlines.

## Site-wide changes

- Removed the divider below the main and employee top navigation.
- Made menu, search and notification actions transparent with black icons.
- Removed outlines from overview metrics, panels, employee cards, settings panels, portal cards, schedule containers and other white surfaces on the grey canvas.
- Removed outlines from standalone white actions placed directly on the canvas.
- Retained separators inside tables, timelines, calendars and forms where they communicate structure or input boundaries.
- Retained intentional semantic outlines for destructive actions, validation, draft indicators and add-slot affordances.
- Applied the same hierarchy to the employee portal, notifications, availability, authentication and modal surfaces.

No database migration is required.
