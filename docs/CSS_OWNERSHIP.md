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
