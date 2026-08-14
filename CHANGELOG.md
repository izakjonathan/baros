# Changelog
## v0.19.0-rc.41

- Repaired CSS/source ownership mismatches found by the full rc.40 audit.
- Standardized page gutters, safe areas, headers, Dialog body structure, shared states, and dark-only theme behavior.
- Moved Shift Plan editor-only layout rules into the Shift Plan CSS module.
- Reconciled runtime class contracts without restoring legacy CSS files.


## 0.19.0-rc.38

- Rebuilt the CSS architecture from scratch using rc.36 as the technical/functionality checkpoint.
- Reduced application styling to global tokens, global application CSS, and one Shift Plan CSS Module.
- Removed all other CSS Modules, route-specific CSS, compatibility layers, release patch stylesheets, and CSS release-history sections.
- Kept existing application routes, APIs, permissions, database behavior, and business workflows unchanged.