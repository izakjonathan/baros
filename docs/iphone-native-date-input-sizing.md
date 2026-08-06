# iPhone native date input sizing

## Problem

Safari gives `input[type="date"]` an intrinsic minimum width. A `width: 100%` rule by itself does not guarantee that two date fields will shrink inside a two-column grid. The result is a control that extends beyond its card or viewport.

## Root-cause correction

Use a shrinkable sizing chain from the grid track to the native input:

```css
.dateGrid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  min-width: 0;
}

.dateGrid > label {
  min-inline-size: 0;
}

.dateGrid input[type="date"] {
  box-sizing: border-box;
  inline-size: 100%;
  min-inline-size: 0;
  max-inline-size: 100%;
}

.dateGrid input[type="date"]::-webkit-date-and-time-value,
.dateGrid input[type="date"]::-webkit-datetime-edit {
  min-width: 0;
  max-width: 100%;
}
```

## Rules

- Use `minmax(0, 1fr)`, not bare `1fr`, for paired form controls.
- Put `min-inline-size: 0` on the grid item or label as well as the input.
- Keep `box-sizing: border-box` and a real maximum inline size on the input.
- Add WebKit date-edit sizing rules for iPhone Safari.
- Do not hide the bug with parent clipping, negative margins, transforms, or viewport-specific widths.
- Keep a regression test that confirms the entire sizing chain remains present.
