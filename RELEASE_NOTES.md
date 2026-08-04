# Bar Ops v0.15.3 — Mobile & iPad Polish

Built from the approved v0.15.2 Search & Productivity baseline.

## Changes
- Removed `public/offline.html`, which caused the reported GitHub commit failure.
- Preserved the controlled offline reconnect experience as a self-contained service-worker response.
- Refreshed the service-worker cache version so installed devices receive the corrected assets.
- Added consistent 44px touch targets for coarse-pointer devices.
- Added safe-area-aware horizontal spacing for iPhone and iPad.
- Improved compact action layouts, dialogs, filters, metrics and form fields on narrow phones.
- Added an iPad breakpoint for workspace padding, metrics, dashboard proportions and dialog height.
- Improved horizontal scrolling containment for schedules and data tables.
- Preserved the v0.15.2 removal of `vercel.json`.

## Compatibility
No database migration, API change, permission change or new business feature.
