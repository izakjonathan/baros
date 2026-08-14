# v0.19.0-rc.47 — Team Workspace Decomposition Wiring Fix

## Fixed
- Corrected the manager application orchestrator to render the feature-owned `TeamWorkspace` after the rc.45 source decomposition.
- Removed the stale `<Team>` component reference that caused Vercel TypeScript to fail with `Cannot find name 'Team'`.
- Added the stale-component check to the existing UI contract rather than creating another test file.
- Scanned the remaining extracted manager workspace render paths; the other feature-owned workspaces already use their correct `*Workspace` symbols.

## Unchanged
- Three-file CSS architecture remains unchanged.
- Shift Plan horizontal-scroll containment from rc.46 remains unchanged.
- Shared fixed top navbar remains site-wide.
- APIs, database schema, permissions, and business workflows are unchanged.

No migration required.
