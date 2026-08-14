# Implementation Status

Version: **v0.19.0-rc.46**

## Current focus
Shift Plan mobile scroll containment after source-architecture decomposition.

## rc.46
- Corrected document-level horizontal scrolling on Shift Plan.
- `.page-wrap[data-workspace="schedule"]` now rejects horizontal overflow.
- Shift Plan workspace, calendar panel, and calendar scroller now form explicit inline-size containment boundaries.
- Only `.calendarScroll` owns horizontal scrolling for the day grid.
- No new CSS file, component layer, database change, or business behavior change.

## Previous structural baseline
- rc.45 split manager workspaces into feature/domain owners and reduced `components/bar-ops-app.tsx` to orchestration/state/dialog coordination.
