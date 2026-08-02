# Bar Ops v0.10.5 — Cleanup & Release Consolidation

This release performs a non-schema cleanup of the v0.10.4 PWA baseline.

## Cleaned

- Removed superseded audit and release-note files from the deployable archive.
- Rewrote README, implementation status and Mono documentation to describe the current release accurately.
- Removed a dead PWA shortcut that linked to an unsupported manager query parameter.
- Removed the manifest portrait-only restriction so the installed iPad app can follow device orientation.
- Rotated the service-worker cache namespace to v0.10.5.
- Updated release compatibility checks and added cleanup-specific regression protection.
- Retained both GitHub Actions workflows, all migrations and the complete regression suite.

No database migration is required.
