# v0.19.0-rc.41 — CSS Contract Integrity

Baseline: **v0.19.0-rc.40** with **v0.19.0-rc.36** retained as the technical/functionality rollback checkpoint.

## What was fixed

- Made `.page-wrap` the single owner of horizontal, bottom, and safe-area page spacing across all workspaces.
- Removed the remaining Employee-specific mobile bottom gutter and normalized Employee page flow to the shared `--gap` token.
- Added one shared `--mobile-gutter` token used by both the top bar and page content on mobile.
- Preserved left/right safe-area handling at the smallest breakpoint instead of overwriting it with shorthand padding.
- Fully reset heading and paragraph margins so layout gaps own vertical rhythm.
- Corrected `--weight-bold` from `750` to the actually loaded Space Grotesk `700` weight.
- Removed the nonfunctional light/dark theme toggle; Bar Ops remains dark-only until a real global light theme exists.
- Forced native form controls on light surfaces to use a light native control color scheme.
- Restored shared loading, empty, error, and spinner visual contracts.
- Added a real `.modal-body` structure to the shared Dialog component so dialog content has one padding/layout owner.
- Moved Shift Plan editor-only controls and repeat/edit composition into `ScheduleWorkspace.module.css`.
- Repaired Employee handover/swap form ownership with shared segmented/form-stack primitives.
- Replaced legacy `portal-action` acknowledgement/request classes with real global button primitives.
- Migrated manager PageHeader and the main Employee page headers onto the shared `WorkspaceHeader` React primitive.
- Reconciled `lib/ui-classes.ts` so every active mapped class resolves to real CSS or a real shared primitive.
- Added missing live global contracts for attendance date controls/preview, shift notes, timeline, developer access, stock-count toolbar, request success, and other runtime hooks uncovered by the rc.40 audit.
- Documented `app/global-error.tsx` as the sole intentional inline-style exception because a root error boundary cannot safely depend on the root layout stylesheet.

## CSS architecture

Still exactly three CSS files:

1. `styles/tokens.css`
2. `app/globals.css`
3. `features/scheduling/ScheduleWorkspace.module.css`

No old CSS files or compatibility layers were restored.

## Database

No migration required.
