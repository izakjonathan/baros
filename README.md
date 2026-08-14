# Bar Ops

Current release: **v0.19.0-rc.43**

Bar Ops is a Next.js operations application for bar scheduling, attendance, team operations, inventory, ordering, requests, and employee self-service.

## Current architecture

### CSS

Exactly three CSS files are shipped:

- `styles/tokens.css`
- `app/globals.css`
- `features/scheduling/ScheduleWorkspace.module.css`

All shared visual rules are global across Owner, Admin, Manager, Shift Manager and Employee. Shift Plan is the only feature allowed custom CSS, limited to schedule-specific composition and its horizontally scrolling day grid.

The shared top navigation uses one `WorkspaceTopbar` component and one global `.topbar` contract. It is fixed site-wide; `.main-shell` owns content clearance beneath it.

### Cards

All non-Shift-Plan surfaces use three global card fundamentals only:

- `.card` — standard card
- `.card-compact` — reduced internal density
- `.card-flush` — no internal spacing for composed panels

Colors are tones applied to the same card primitive, not separate card styles. Shift Plan's `.shiftCard` is the sole custom card exception.

### Active testing

The active repository ships only current tests and release/database tooling. Historical release-specific test scripts are retained in previous ZIPs and Git history rather than copied into every new release.

Use:

- `npm run test:current` — current regression gate
- `npm run test:rc43` — rc.43 repository/shell/Shift Plan contract
- `npm run audit:preflight` — release stabilization preflight
- `npm run validate:release` — release metadata contract
- `npm run audit:artifacts` — release-package hygiene

## Rollback checkpoint

Rollback checkpoint: **v0.19.0-rc.36**.

rc.36 is not an approved visual baseline; it is the functionality/recovery checkpoint used for the CSS rebuild.
