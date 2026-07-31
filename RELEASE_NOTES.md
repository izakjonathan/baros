# v0.5.0 — Deep audit and operational hardening

This release is based on v0.4.1 and performs the broadest product, component, design, layout, accessibility, and workflow audit so far.

## Added

- Timesheet Needs review queue and status filters
- Attendance exception detection
- Manager correction dialog with required reason
- Reject and reopen workflows
- Reversible timesheet approval
- Session export history
- Fourth attendance metric for exceptions
- Responsive four/two/one-column filter system
- Shared layout and interaction tokens
- Keyboard focus states
- Reduced-motion support
- 44px minimum primary interaction targets
- Deep product audit and research matrix
- `npm run test:audit`

## Improved

- Manager page density and hierarchy
- Header and action wrapping
- Mobile forms and dialogs
- Data table readability
- Calendar tap targets
- Narrow-screen handling
- Payroll review clarity
- Distinction between pending, approved, rejected, corrected, and exported time

## Validation

- Shift logic regression suite passed
- Payroll export regression suite passed
- Deep audit assertions passed
- ZIP archive validation passed
- Full dependency installation/build could not run because the workspace npm mirror returns 404 for standard scoped packages
