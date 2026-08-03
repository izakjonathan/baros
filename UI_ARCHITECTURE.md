# UI architecture — v0.15.0

The previous build loaded four global stylesheets in sequence. Three of them redefined the same responsive selectors, so later media queries could restore older layouts after the new interface layer had apparently corrected them.

v0.15.0 removes the two superseded global presentation files from the project and uses this order only:

1. `app/design-tokens.css` — semantic variables
2. `app/globals.css` — existing feature structure required by the current monolithic UI
3. `app/interface-v015.css` — the sole final presentation and responsive ownership layer

The final layer explicitly owns top navigation, page rhythm, manager navigation, cards, Team, Timesheets, Shift Plan and modal geometry. New visual changes should be made there until the monolithic `globals.css` is split feature by feature.
