# Bar Ops v0.9.4 — Schedule Control & Team Card Layout Fix

## Schedule workspace
- Replaced the three-button Week/Month/Custom control with a compact dropdown beside Copy and Add shift.
- Kept period navigation and publishing in the schedule toolbar.
- Contained custom From/To fields in a dedicated responsive toolbar row on narrow screens.
- Prevented date controls from overflowing the viewport or covering navigation and publishing controls.

## Team cards
- Locked every employee identity row to the same structure: avatar on the left, name and role directly beside it, status pill on the right.
- Added narrow-screen sizing safeguards so employee names and roles do not fall below the avatar.

## Validation
- All bundled regression suites passed, including a new v0.9.4 layout regression test.
- No database migration is required.
