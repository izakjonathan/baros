# Bar Ops v0.9.2 — Workspace UI optimization

This release implements the requested mobile workspace refinements on top of v0.9.1 and includes a build-fix for the malformed Control Centre JSX discovered during Vercel deployment.

## Interface changes
- Removed the Add shift action from Overview.
- Fixed the top navigation to the viewport and made its three controls square.
- Added functional workspace search and notifications popovers.
- Overview and Time & attendance metric cards use a responsive 2×2 grid on mobile.
- Settings navigation and cards were rescaled for narrow screens; the introductory sentence was removed.
- Shift plan supports Week, Month and Custom date ranges, with range publishing and a full-cell current-day highlight.
- Team header and employee cards were condensed; identity, status and actions use less vertical space.
- Removed the requested descriptive copy from Time & attendance, Team and Edit employee.

## Build correction
- Corrected the malformed closing JSX fragment in the Control Centre component that caused the Vercel “Expression expected” error.
- Removed stale TypeScript build metadata.
- Updated regression expectations for package version 0.9.2.

## Database
No migration is required.
