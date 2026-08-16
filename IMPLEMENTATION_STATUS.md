# Implementation Status

Version: **v0.19.0-rc.52**

## Current focus
Shift Plan document-width containment on iPhone Safari.

## rc.52
- Shared single-column page/workspace grids now use explicit zero-minimum tracks so feature min-content cannot widen the document.
- Shift Plan page boundaries use non-scrollable inline clipping while the existing calendar scroller retains horizontal touch scrolling.
- Schedule responsive tracks no longer use bare `1fr` auto minimums.
- No database, API, authorization, permission, or business-workflow changes.
- Rollback checkpoint: v0.19.0-rc.51.
