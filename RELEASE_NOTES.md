# Bar Ops v0.3.4 — Mobile dialog scrolling fix

Based on v0.3.3.

## Fixed
- Add Shift and other dialogs now have their own vertical scroll container.
- Mobile dialogs use a bottom-sheet layout sized with `100dvh`.
- iOS momentum scrolling and vertical touch gestures are explicitly enabled.
- The modal header and action buttons stay visible while the form scrolls.
- Safe-area padding keeps actions above the Safari controls and home indicator.
- Time inputs and other form fields can no longer overflow their grid columns.
- Background page scrolling is locked while a dialog is open.
