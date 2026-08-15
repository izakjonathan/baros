# Implementation Status

Version: **v0.19.0-rc.50**

## Current focus
Dependency-backed build repair and source-ownership cleanup.

## rc.50
- Fixed the rc.49 Attendance `History` runtime-import failure reported by Vercel TypeScript validation.
- Added same-class regression coverage for unbound capitalized JSX components.
- Shift Plan editor dialogs are now owned by the scheduling feature.
- The orchestrator renders shared chrome and dialog primitives directly instead of through local forwarding adapters.
- Rollback checkpoint: v0.19.0-rc.49.
