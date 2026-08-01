# Bar Ops v0.8.8 — Schedule Workspace Redesign

## Schedule creation

- Tapping **Add shift** inside a day column now opens the form with that exact calendar date selected.
- The top-level Add shift action defaults to the first visible day.
- Repeating-shift weekday defaults follow the selected date.

## Compact schedule layout

- Removed the descriptive sentence below the Shift plan title.
- Moved Copy previous week and Add shift into a compact action row beside the title.
- Reduced title, toolbar, day-header, shift-card, and add-slot height.
- Increased the vertical area available to the schedule grid.
- Added sticky compact day headers while the schedule is scrolled.

## Views and navigation

- Added Week and Month view controls.
- Previous/next navigation follows the selected view.
- Both views use a horizontally scrollable day rail with scroll snapping on touch devices.
- Month view shows every date of the selected month as a compact day column.
- Publishing remains a week-based action to preserve the existing publication and notification model.

## Research basis

The layout follows current workforce scheduling conventions: period/view controls remain next to navigation, creation occurs from the target day, and longer periods are navigable with horizontal day scrolling. Planday and Deputy both expose Day/Week/Month period selection and direct creation from the intended day; FullCalendar documents separate week/day views and scrollable time/day surfaces.

No PostgreSQL migration is required.
