# v0.4.0 — Mobile audit and overnight shift hardening

- Makes the shift start date canonical and independent of the end time.
- Reassigning an overnight available shift no longer changes its scheduled day.
- Shows `+1` and “Overnight” when a shift ends on the following calendar day.
- Copies canonical dates correctly when copying the previous week.
- Restores pinch zoom and reliable vertical scrolling in iOS dialogs.
- Prevents modal and employee-portal horizontal overflow.
- Uses 16px mobile form controls to avoid Safari focus zoom.
- Preserves and restores background scroll position while dialogs are open.
- Adds source-level shift-date, overnight, recurrence, and copy-week regression checks.
