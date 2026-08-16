# v0.19.0-rc.52 Validation

## Confirmed baseline
The complete v0.19.0-rc.51 ZIP was extracted into a new working directory and verified as version `0.19.0-rc.51` before modification. That release remains the rollback checkpoint.

## Root cause and correction
- The Shift Plan calendar deliberately has a wide minimum inline size inside its horizontal scroller.
- Ancestor single-column grids still used implicit `auto` tracks, allowing wide min-content to influence document width in Safari despite local `min-width: 0` and containment.
- Page-level `overflow-x: hidden` declarations created overflow containers instead of making the sizing chain explicitly shrink-safe.
- Shared page/workspace grids now use `minmax(0, 1fr)` tracks. Document and Shift Plan page/workspace boundaries use non-scrollable horizontal clipping.
- The existing calendar scroller remains the sole horizontal scroll owner and retains touch momentum plus physical-axis overscroll containment.
- Schedule responsive grids no longer use bare `1fr` tracks, and mobile header actions can shrink below their intrinsic content width.

## Source integrity
- CSS files: 3.
- Active `scripts/*.mjs`: 17.
- Repository files: 179 before packaging.
- Existing CSS owners changed: 2; CSS files and selector systems added: 0.
- Net CSS declarations: +3, all used to establish shrink-safe shared tracks or shrink-safe mobile action sizing.
- No TypeScript/TSX, database schema, migration, API, authorization, permission, visual direction, or business workflow changed.

## Regression and release gates
Passed:
- all ten Node scripts underlying `test:current`, run directly;
- `node scripts/validate-release.mjs`;
- `node scripts/check-release-artifacts.mjs`;
- `node scripts/preflight-stabilization.mjs`;
- `node --check` for `eslint.config.mjs` and all 17 active `scripts/*.mjs`;
- CSS structural parse.

The existing UI contract now verifies the full horizontal-overflow ownership chain: document clipping, zero-minimum shell tracks, non-scrollable Schedule boundaries, the calendar scroller's `overflow-x: auto`, and removal of Schedule's bare responsive `1fr` tracks.

## Dependency-backed and device limitations
- The extracted release contains no `node_modules` or lockfile, so local ESLint, TypeScript, and Next.js executables are unavailable.
- No local lint, dependency-backed TypeScript, or Next.js production-build pass is claimed.
- Vercel remains the authoritative dependency-backed build/type gate.
- Static contracts cannot substitute for a physical iPhone Safari interaction check; final document-versus-calendar scroll behaviour remains a device acceptance check.
