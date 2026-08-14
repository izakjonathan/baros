# v0.19.0-rc.39 — Attendance Status Type Contract

- Fixes the Vercel TypeScript failure in `components/bar-ops-app.tsx` caused by dynamically indexing `attendanceStyles` with `statusRunning`, `statusPending`, `statusApproved`, and `statusRejected` keys that were missing from the typed global class contract.
- Adds those four keys to `lib/ui-classes.ts` and restores the intended global status colors in `app/globals.css`.
- Preserves the rc.38 CSS architecture reset: exactly three CSS files, global styling for all non-Shift-Plan surfaces, and one Shift Plan CSS module.
- No database, API, permission, workflow, or layout changes.

# v0.19.0-rc.39 — CSS Architecture Reset

Baseline: **v0.19.0-rc.36** as a technical/functionality rollback checkpoint, not a visual baseline.

## Changes

- Rebuilt all application CSS from scratch.
- Reduced styling to three CSS files: global tokens, global application CSS, and Shift Plan custom CSS.
- Removed every other CSS Module and route-specific stylesheet.
- Removed compatibility layers and historical release-patch CSS.
- Rewired shared primitives and workspace class contracts to global styling.
- Preserved routes, APIs, permissions, database behavior, and operational workflows.
- Replaced CSS-era regression ownership checks with a current CSS architecture contract while retaining historical tests separately.

## Database
No migration required.
