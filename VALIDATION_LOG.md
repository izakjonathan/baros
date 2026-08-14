# Validation log — v0.19.0-rc.36

Validation target: recovery from rc.35 visual regressions.

- Restored all 11 CSS files modified by rc.35 to byte-identical rc.34 versions.
- Added hash-based recovery protection for those files.
- Restored aggregate CSS baseline: 25 files / 4,135 declarations / 1,397 rules / 141,171 bytes / 9 `!important`.
- rc.35's sub-4000 budget is intentionally retired because it encoded the unsafe deletion target.
