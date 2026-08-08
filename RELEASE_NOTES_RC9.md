# v0.19.0-rc.9 — Vercel TypeScript Build Hotfix

## Scope

- Normalize nullable manager timesheet notes at the client mapping boundary.
- Preserve the existing `TimeEntry` domain contract where missing notes are represented as `undefined`.
- Add a focused regression for the exact Vercel TypeScript failure.
- No visual, permission, database, or business-logic changes.

## Root cause

The manager bootstrap contract permits `manager_note` to be `null`, while `TimeEntry.note` permits `string | undefined`. The bootstrap mapper forwarded `null` directly into client state.

## Correction

The mapping now uses `x.manager_note ?? undefined`. This keeps the nullable database/API representation at the boundary and gives the client domain model its expected optional-string representation.
