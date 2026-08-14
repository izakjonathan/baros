# Implementation Status

Version: **v0.19.0-rc.43**

- CSS architecture remains exactly three files: tokens, global application CSS, and Shift Plan custom CSS.
- Shared styling remains global across Owner, Admin, Manager, Shift Manager, and Employee workspaces.
- Shared top navigation is fixed site-wide and implemented by the same `WorkspaceTopbar` component for every workspace.
- `.main-shell` is the single owner of fixed-topbar content clearance.
- Shift Plan is the only feature with custom CSS and `.calendarScroll` is the only owner of its horizontal day-grid scrolling.
- The active repository no longer ships the historical release-test archive: 26 active scripts remain instead of 200.
- npm command surface is reduced to 25 current development/database/validation/test commands instead of 208 historical commands.
- Card fundamentals remain limited to `.card`, `.card-compact`, and `.card-flush` plus the Shift Plan shift-card exception.
- Existing-code-first modification remains mandatory: change/replace/merge the current owner before adding new code where possible.
- No database migration.
- No final visual baseline has been approved; physical-device visual QA remains required.
