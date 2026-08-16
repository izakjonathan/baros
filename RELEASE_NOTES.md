# v0.19.0-rc.52 — Shift Plan Document-Width Containment

## Baseline
- Continued from the complete v0.19.0-rc.51 release ZIP, which remains the rollback checkpoint.

## Root cause and fix
- The wide seven-day calendar was correctly placed inside `.calendarScroll`, but implicit `auto` tracks in the ancestor page/workspace grids could still accept its min-content contribution on Safari.
- Schedule also used page-level `overflow-x: hidden`, which creates overflow containers rather than correcting the sizing chain.
- Shared single-column shell grids now use `minmax(0, 1fr)`, and Shift Plan page/workspace boundaries use `overflow-x: clip`.
- The existing calendar scroller keeps `overflow-x: auto`, inline-size containment, momentum touch scrolling, and horizontal overscroll containment.
- Responsive Schedule grids now use zero-minimum tracks so native controls and action groups cannot widen their parent.

## Scope
Two existing CSS owners were changed. No stylesheet, selector system, component, database migration, API, authorization rule, permission, visual direction, or business workflow was added or changed.

Rollback checkpoint: **v0.19.0-rc.51**.
