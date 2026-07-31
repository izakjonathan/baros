# Bar Ops v0.3.5 — Week navigation and recurrence fix

- Week navigation now changes the visible seven-day schedule.
- Shift records in development state carry a week offset.
- Daily repeats flow into later weeks instead of wrapping onto the same visible week.
- Weekly repeats create one occurrence per selected weekday per week.
- Duplicate dates are removed before a recurring series is saved.
- Publishing affects only the currently visible week.

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
