# Shift Plan CSS ownership

**Established:** v0.19.0-rc.7

## Purpose

The Shift Plan has a large historical stylesheet and a high visual regression surface. This release does not redesign it. It establishes one final responsive owner for the accepted mobile toolbar, selector and day-track behaviour.

## Accepted mobile contract

- Breakpoint: `max-width: 48rem`.
- Toolbar tracks: flexible period controls, `4.9rem` view selector, `2.35rem` publish action.
- The native Week/Month/Period select remains the interaction layer. `.viewLabel` owns visible text so Safari cannot clip it.
- Mobile day track width: `6.55rem`.
- Deliberate separator: `.16rem`.
- The grid track and `.dayColumn` must use the same `--mobile-day-column` value.
- Track width must not be derived from `100vw`.
- Draft shifts remain muted with dotted styling and no visible Draft pill.
- Horizontal scrolling, role colors, editing and publication behaviour remain unchanged.

## Canonical owner

The final block in `features/scheduling/ScheduleWorkspace.module.css`, marked:

`v0.19.0-rc.7 — authoritative Shift Plan responsive ownership`

owns:

- `.viewSelect`, `.viewLabel`, and the native selector overlay;
- the mobile `.toolbar` tracks;
- mobile `.periodControls`;
- mobile `.calendarGrid` auto-flow and track sizing;
- mobile `.dayColumn` width and internal gap.

## Removed owners

The separate v0.18.13.3, v0.18.13.5 and v0.18.13.6 correction blocks were superseded and removed. Their accepted final values are consolidated in the canonical owner.

## Change rule

Do not add another later schedule correction block. Change the canonical owner after tracing the component, parent layout, global CSS, media queries and state classes. Any change requires focused checks for 320, 375, 390 and 430px widths plus physical iPhone Safari verification.
