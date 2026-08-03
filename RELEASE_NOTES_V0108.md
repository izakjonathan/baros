# Bar Ops v0.10.8

## Purpose

Employee workspace linkage reliability only.

## Root cause

Employee sessions stored a location only at login or activation. Accounts created before a location assignment, or sessions created before the assignment was corrected, could therefore retain a null location even when the organization had a valid employee/location relationship. The time-clock endpoint then rejected clock-in, while the UI could only show a generic error.

## Changes

- Resolve the current employee and active location from live database relationships on every authenticated request.
- Use the session location only when it still belongs to the organization and is active.
- Fall back to the employee's primary active location.
- Fall back to the organization's location only when exactly one active location exists.
- Return a precise eligibility reason from the time-clock endpoint instead of allowing a generic runtime failure.
- Surface that reason in My Hours.

## Files changed

- `lib/auth/session.ts`
- `app/api/time-clock/route.ts`
- `app/employee/hours/page.tsx`
- `scripts/test-v0108-employee-linkage.mjs`
- `package.json`
- `public/sw.js`

## Database

No migration is required. No schema was changed.

## Scope exclusions

No CSS, layout, owner-workspace UI, scheduling, payroll, inventory, or database schema changes were made.
