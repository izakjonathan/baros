# Release notes — v0.19.0-rc.36

## Visual Regression Recovery

- Marks rc.35's aggressive declaration-removal pass as visually unsafe.
- Restores the 11 CSS files changed by rc.35 to their rc.34 validated contents.
- Fixes regressions visible in employee schedule note controls, manager payroll/time & attendance controls, daily operations metric content, shift execution cards/actions, and other surfaces sharing those styles/tokens.
- Removes the rc.35 sub-4000 declaration budget from the inherited release gate.
- Adds an rc.36 recovery test that locks the restored CSS files and aggregate CSS metrics.

CSS baseline after recovery: 25 files, 4,135 declarations, 1,397 rules, 141,171 bytes, 9 `!important` declarations.
