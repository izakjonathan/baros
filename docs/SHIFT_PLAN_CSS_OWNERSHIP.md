# Shift Plan CSS ownership

## Purpose

This document records the accepted ownership boundaries after the rc.7 consolidation. It does not authorize visual redesign.

## Owners

- `ScheduleWorkspace.tsx` owns schedule structure, state-driven classes, the native view selector interaction layer, and the component-owned visible selector label.
- `ScheduleWorkspace.module.css` owns all internal Shift Plan presentation and responsive composition.
- Parent workspaces own only the external space around the Shift Plan.
- Global shared-control CSS may own focus and interaction-size contracts, but not schedule widths, tracks, colors, cards, or responsive geometry.

## Canonical mobile ownership

The final `v0.19.0-rc.7` block is the only late override owner for:

- toolbar tracks;
- period-control tracks;
- Week/Month/Period selector containment;
- native selector overlay positioning;
- mobile calendar auto-flow;
- mobile day-column width;
- deliberate inter-day separator;
- day-column inline sizing.

Accepted values are:

- day column: `6.55rem`;
- separator: `.16rem`;
- selector track: `4.9rem`;
- publish-action track: `2.35rem`.

These values reflect the accepted physical-device result. They are not generic design tokens.

## Preserved state presentation

- Draft shifts remain muted with a dotted outline and no Draft pill.
- Published and open states retain their existing state and role presentation.
- Horizontal scrolling remains the mobile navigation model.
- Week, Month, and Period retain the native select as the accessible interaction layer and component-owned visible text.

## Retired layers

The release-specific correction blocks from v0.18.13.3, v0.18.13.5, and v0.18.13.6 were consolidated into the canonical owner. Future corrections must modify that owner rather than append another release block.

## Remaining debt

The stylesheet still contains substantial historical specificity and repeated earlier rules. They were not broadly removed because their rendered interactions cannot be proven through static inspection alone. Further reduction requires automated screenshots and physical Safari verification.
