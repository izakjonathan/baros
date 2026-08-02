# Bar Ops v0.10.4 — Installable PWA & iOS Standalone

## Added
- App Router web app manifest with standalone display, start URL, scope, categories and shortcuts.
- 192px, 512px, maskable and Apple touch icons.
- Apple standalone metadata and status-bar configuration.
- Production-only service-worker registration.
- Controlled offline page.
- Network-only handling for authenticated pages, API requests and account activation.
- Static-only runtime caching for Next.js assets, manifest and icons.
- Service-worker cache/version cleanup on activation.
- Standalone safe-area and overscroll handling for iPhone and iPad.
- CSP and response headers required for the service worker and manifest.
- PWA regression test included in `npm run test:all`.

## Installation note
After deployment, remove any older Bar Ops Home Screen shortcut and add the site again from Safari so iOS reads the new manifest and icon metadata.

## Database
No migration is required.
