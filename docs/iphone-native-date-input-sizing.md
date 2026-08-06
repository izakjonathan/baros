# iPhone native date controls

## Root cause

Safari owns the internal text layout of `<input type="date">`. Width containment can be made reliable with shrinkable grid tracks, but vertical and horizontal text placement inside the native control is not reliably controlled by `padding`, `line-height`, `text-align`, `::-webkit-date-and-time-value`, or `::-webkit-datetime-edit`.

Repeatedly overriding those browser-owned internals caused the Time & Attendance date alignment regression to return.

## Permanent Bar Ops pattern

For visually designed date controls:

1. Keep the real native date input for accessibility, keyboard interaction, validation, and the platform date picker.
2. Place it absolutely over the full control and make it visually transparent.
3. Render the formatted date in a separate component-owned element underneath it.
4. Center that visible value with normal CSS layout (`display: grid; place-items: center`).
5. Keep paired controls in `repeat(2, minmax(0, 1fr))` tracks and preserve `min-inline-size: 0` throughout the sizing chain.
6. Apply focus styling to the wrapper with `:focus-within`.

Do not attempt to align the visible date by styling Safari pseudo-elements. Do not clip a parent or add compensating margins.
