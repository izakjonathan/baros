# CSS ownership contract

## Shared owners

- `app/design-system.css`: primitive and semantic tokens.
- `app/shared-controls.css`: shared button/control alignment, interaction size, focus, busy and disabled behaviour.
- `app/interface-consistency.css`: intrinsic-width containment and transient viewport bounds.
- `app/accessibility-interaction.css`: skip link, reduced motion, forced colors and accessibility-only interaction support.
- feature `*.module.css`: internal feature presentation and responsive composition.
- `app/employee/EmployeeWorkspace.css`: employee route-scoped presentation.
- `features/scheduling/ScheduleWorkspace.module.css`: all internal Shift Plan presentation; see `docs/SHIFT_PLAN_CSS_OWNERSHIP.md`.

## Rules

1. Components own internal presentation; parents own external spacing.
2. Shared files may define only proven cross-workspace contracts.
3. Feature-specific color, width, layout and responsive rules stay with the feature.
4. Do not fix a cascade conflict by adding a later opposite declaration. Remove or narrow the superseded owner.
5. Do not use overflow clipping, negative margins or arbitrary fixed heights to conceal intrinsic sizing defects.
6. Shift Plan toolbar and mobile track ownership were consolidated in rc.7; further specificity reduction requires rendered verification.

## rc.25 consolidation gate

v0.19.0-rc.25 converts the CSS trace into a release rule:

- Superseded declarations for the exact same selector, property and media/context are removed rather than left as historical patches.
- The Schedule stylesheet remains the feature owner, but historical exact duplicates are retired while preserving the accepted rc.7 responsive owner.
- `app/mono-tokens.css` is compatibility-only and lives in the lower-priority `legacy` cascade layer. Canonical shared tokens live in `styles/tokens.css`.
- Do not reintroduce shared spacing, typography, radius or control-height literals in `mono-tokens.css`.
- Do not append a new release-specific override block to Schedule. Modify the existing owning selector or the rc.7 canonical responsive owner after tracing the cascade.
- Any future CSS cleanup must preserve the winning value or be treated as an intentional visual change with device verification.

The rc.25 regression gate caps Schedule `!important` usage at 500 and physical size below 2,200 lines so append-only growth becomes a test failure instead of a future audit surprise.

## rc.26 dead selector gate

A global or legacy selector may be removed only when each selector branch is tied to class names that have no live markup reference in the current application source. Generic element, ARIA, state, CSS-module-local, and canonical design-system selectors are not removed by this gate. New release work must not reintroduce dead selector blocks as historical patches; update the owning live selector instead.
