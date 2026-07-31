# Bar Ops v0.4.0 audit

## Defects corrected

1. **Shift date moved one day after editing**
   - Root cause: date positioning compared a date at 12:00 with a base date at 00:00 and used `Math.round`, producing a one-day offset.
   - Fix: calendar-only UTC date serial arithmetic; shift date is now a canonical field and is never inferred from the end time.

2. **Overnight shift ambiguity**
   - Shifts with end time earlier than or equal to start time remain attached to their start date.
   - UI now labels them `+1` and “Overnight”.

3. **iPhone modal scaling and scrolling**
   - Removed touch-action restrictions that prevented natural scrolling and pinch zoom.
   - Bounded dialogs to the visual viewport and prevented horizontal overflow.
   - Mobile controls are at least 16px to prevent Safari focus zoom.
   - Background scroll position is preserved while dialogs are open.

## Regression coverage performed

- Date-to-week/day calculation around Friday–Monday boundaries.
- Overnight versus same-day end-time detection.
- Available-shift reassignment preserving the start date.
- Daily recurrence crossing a week boundary.
- Previous-week copying advancing the canonical date by seven days.
- Modal width, overflow, touch-action, safe-area, and input sizing rules.
- Existing manager navigation, week publishing, employee add/edit, attendance, and developer role-switch routes inspected for regressions.

## Build limitation

The archive and source checks pass. A full `next build` could not be executed in the workspace because its internal npm mirror returns 404 for standard packages including `@types/node`. Run `npm install && npm run build && npm run test:logic` in Vercel or a normal npm environment.
