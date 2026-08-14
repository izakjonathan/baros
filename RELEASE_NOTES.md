# v0.19.0-rc.46 — Shift Plan Horizontal Scroll Containment

## Fixed
- Prevented the Shift Plan workspace/document from participating in horizontal scrolling on Safari/iPhone.
- Made the schedule page wrapper explicitly reject horizontal overflow.
- Added inline-size containment to the Shift Plan workspace, calendar panel, and calendar scroller so the wide seven-day grid cannot contribute intrinsic width to the page.
- Kept horizontal scrolling exclusively on the day-grid scroller.

## Unchanged
- Shared fixed top navbar remains site-wide across Owner, Admin, Manager, Shift Manager, and Employee.
- Three-file CSS architecture remains unchanged.
- APIs, database schema, permissions, and business workflows are unchanged.

No migration required.
