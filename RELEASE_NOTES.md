# Bar Ops v0.13.1 — Floating Navigation Placement

Built directly on v0.13.0.

## Fixed

- Moved the manager floating navigation down to the bottom edge of Safari's visual viewport.
- Removed the duplicated browser safe-area offset that made the menu sit unnecessarily high.
- Added separate browser and installed-PWA placement tokens.
- Kept the toggle circle and expanded pill on one fixed vertical centre.
- Preserved dialog hiding, horizontal menu scrolling, reduced motion and device side safe areas.
- Corrected a malformed opening comment in `design-tokens.css` so the token stylesheet parses cleanly from its first rule.

## Central controls

```css
--floating-nav-bottom-browser: 2px;
--floating-nav-bottom-standalone: calc(env(safe-area-inset-bottom, 0px) + 8px);
```

## Validation

- Full `npm run test:all` passed.
- New v0.13.1 floating-navigation placement checks passed.
- No database migration is required.
