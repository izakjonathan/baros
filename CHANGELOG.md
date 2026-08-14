# Changelog
## v0.19.0-rc.42

- Reduced the global card architecture to one base card plus compact/flush density modifiers.
- Removed the legacy panel surface and obsolete card variants.
- Migrated feature and employee surfaces to the shared card contract without adding CSS files.
- Added an existing-code-first rule for future CSS/functionality changes.

## v0.19.0-rc.42

- Reduced the global card system to standard, compact, and flush fundamentals only.
- Removed obsolete card state/muted/elevated/panel fundamentals and duplicated feature card geometry.
- Kept Shift Plan as the sole custom card-layout exception.
- Added governance requiring existing code to be changed/replaced/consolidated before new primitives are introduced where possible.

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