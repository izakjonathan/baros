# Implementation status — v0.10.6

## Current baseline

v0.10.6 is the current working baseline. It retains all v0.10.5 operational and PWA functionality while consolidating the CSS and design-system architecture.

## Architecture

- PostgreSQL/Neon runtime and migrations remain unchanged.
- Manager and employee workflows remain unchanged.
- PWA manifest, icons, service worker and iOS standalone support remain active.
- Visual constants are centralized in `app/design-tokens.css`.
- Shared visual components are centralized in `app/design-system.css`.
- Structural feature layout remains in `app/globals.css`.

## Remaining architecture work

- `components/bar-ops-app.tsx` is still a large manager component and should be split feature-by-feature in a later dedicated release.
- Some historical regression scripts retain old version names, but now validate current semantic behavior.
- A dependency lockfile should be generated and committed when a full public npm install is available.
- Browser end-to-end and disposable PostgreSQL integration tests remain recommended.
