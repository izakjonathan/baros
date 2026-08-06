# Site-wide containment contract

Version 0.18.12 establishes one shared containment layer for problems that can occur across unrelated workspaces.

## Ownership

- Feature CSS modules own component appearance and internal layout.
- `spacing-system.css` owns external page and section spacing.
- `interface-consistency.css` owns only cross-surface width containment, native-control shrinkability, mobile popover viewport safety, and very-narrow dialog action fallback.

## Required mobile control pattern

Any grid containing native date, time, month, or datetime controls must use shrinkable tracks such as `repeat(2, minmax(0, 1fr))`. Grid items and labels must have `min-inline-size: 0`. Controls must use `inline-size: 100%`, `max-inline-size: 100%`, `min-inline-size: 0`, and `box-sizing: border-box`.

Do not hide overflow at a card level, use negative margins, or add an opposite transform to compensate for an intrinsically wide native control.

## Popovers

On phone widths, manager top-bar popovers are positioned against the viewport and safe-area gutters rather than the triggering button. This prevents search and notification surfaces from escaping the right edge.

## Regression expectation

The release test must verify the stylesheet import order, the native-input contract, viewport-owned phone popovers, and the absence of forbidden clipping or compensating transforms in the shared correction layer.
