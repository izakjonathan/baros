# Bar Ops v0.3.6 — Editable shift assignments

## Added
- Tap or click any existing shift card to open its full edit view.
- Reassign an existing shift to any employee in the team list.
- Convert an assigned shift into an Available shift.
- Assign an Available shift directly to an employee.
- Edit weekday, role, start time, end time, and draft/published status.
- Delete an existing shift from the edit view.
- Repeating occurrences clearly state that the current edit affects only the selected occurrence.
- Mobile-safe sticky edit actions and accessible focus states.

## Product research applied
The workflow follows established scheduling patterns used by Planday, When I Work, Deputy and similar systems: opening an existing shift exposes assignment and shift details in one view; an assigned shift can be changed to an unassigned/open shift; open shifts remain existing shifts rather than being deleted and recreated; and employees can later request the open shift subject to manager approval.

## Development-state note
These edits work in the database-free manager workspace. They update local in-memory state until PostgreSQL is connected. The persistent shift update API remains the target for the database-backed manager workspace.
