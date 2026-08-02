# Bar Ops v0.9.5 — Employee Portal Rebuild

This release is built directly from the user-supplied `bar-ops-v0 9 4-redesign.zip` baseline and preserves its manager-workspace redesign.

## Employee portal

- Published-only assigned and available shifts.
- Faster employee navigation with loading and error states.
- Compact Home, Schedule, Clock, Requests and More navigation.
- Employee home summary with next shift, clock status, requests and notifications.
- Incoming handover/swap responses and outgoing exchange history.
- Recurring weekly availability editor backed by PostgreSQL.
- Better leave-request validation, response messages and refresh behavior.
- Persistent employee notification centre with mark-all-read support.
- Venue-timezone schedule and hours formatting.
- Time-clock state is loaded before actions appear.
- Geolocation-aware clock-in and configured early-clock-window enforcement.
- In-app timesheet correction form.

## Baseline preservation

The uploaded v0.9.4 redesign remains the source baseline. Its typography, manager layout, schedule toolbar, team-card redesign and responsive workspace styles have not been replaced by an older release.

## Database

No new migration is required.
