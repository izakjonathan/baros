# Bar Ops Implementation Status — v0.19.0-rc.13

Employee shell unification is complete at source level. Owner/manager and employee workspaces now share the same top bar and side-navigation components. The employee workspace defaults to dark mode and retains role-aware employee-only navigation. Employee business logic, APIs, permissions and persistence are unchanged.

Physical iPhone Safari verification, dependency-backed TypeScript/build validation and Vercel staging remain acceptance gates.

# v0.19.0-rc.9 implementation status

Runtime build preparation is complete at source level. Deterministic install, lint, type-check, build, and staging remain blocked until a real lockfile can be generated with registry access.

Shift Plan toolbar, selector and mobile track ownership are consolidated. Broader schedule specificity cleanup remains deferred until rendered regression coverage exists.

# v0.19.0-rc.6 — Type Safety, Test Cleanup & Build Reproducibility

This release adds typed client/API response contracts, separates current regression gates from historical assertions, and records the unresolved deterministic-install blocker. No visual design or business behaviour was intentionally changed.

# Current implementation status — v0.19.0-rc.5

The dedicated employee workspace redesign is complete at source level. Runtime, Safari, VoiceOver, staging and dependency-backed production gates remain pending.

# Bar Ops v0.19.0-rc.3 — Implementation Status

Phase B source-level authorization alignment is complete. Live authenticated role testing, multi-tenant negative testing, concurrency testing, database verification, and staging acceptance remain pending.

The employee workspace is **not yet redesigned** and remains a dedicated future scope item.

# Bar Ops v0.19.0-rc.2 — Implementation Status

Phase B1 capability alignment is implemented. Production acceptance remains pending.

# Current release: v0.19.0-rc.1

Production acceptance tooling and documentation are complete at source level. Production sign-off is explicitly pending external dependency installation, lint, type-check, production build, staging deployment, database verification, critical workflow testing and physical-device acceptance.

## Added

- Staging acceptance matrix
- Deployment sign-off evidence record
- Exact-tested-deployment promotion rule
- Critical rollback triggers
- Focused source regression and acceptance command

## External gates still required

- Clean dependency installation
- ESLint
- Complete TypeScript validation
- Next.js production build
- Staging database verification
- Manager and employee end-to-end workflows
- iPhone Safari, desktop Safari and Chrome acceptance
- Final production approval

# Current release: v0.18.15

Production-readiness source hardening is complete. The release now has explicit quality, deployment, acceptance and rollback contracts. Dependency-backed lint, type-check and production build remain external gates because the available package registry does not contain the pinned `@types/node@22.10.2` package.

# Current release: v0.18.14

Accessibility and interaction QA is implemented at source level. Physical VoiceOver, touch, and Safari keyboard acceptance remains a deployment/device task using `V01814_DEVICE_ACCEPTANCE.md`.

# v0.18.14 implementation status

Complete: the redundant visible Draft pill has been removed from Shift Plan cards. Draft shifts retain their muted styling, dotted outline, state data, publishing behavior and persistence.

# v0.18.13.6 implementation status

Complete: mobile Shift Plan track and day-column widths now have one owner. The false inter-column spacing caused by wider grid tracks surrounding capped child columns has been removed. Physical iPhone verification remains the acceptance step after deployment.

# v0.18.13.5

Time & Attendance date controls now use the permanent component-owned visual date pattern. Native iOS date picking, constraints, change handling, and accessibility remain intact.

# v0.18.13.3 implementation status

Complete: physical-device component corrections for nested fills, attendance filters and Team search.

# v0.18.13.1 implementation status

Status: **Implemented and packaged**

Physical-device corrections completed for manager header flow, shared search controls, attendance date separation, Daily Operations density, Dashboard Quick Actions and Inventory card actions. Automated source-level regression, release validation, preflight and artifact checks are included. Browser/device re-verification remains the acceptance step after deployment.

# Implementation Status — v0.18.13

## Completed

- Full cross-product visual QA and consistency pass.
- Shared typography, control sizing, touch-target and focus contracts.
- Long-content, dense-data and transient-surface containment.
- Consistent loading, empty and error states.
- Regression coverage and documented ownership boundaries.

## Next phase

- Accessibility and interaction QA.
- Physical iPhone and iPad screenshot verification.
- Corrections based on rendered-device evidence.

## Pending external gates

- Clean dependency installation
- ESLint
- TypeScript compilation
- Next.js production build
- Browser and physical-device verification

# Implementation Status — v0.18.12

## Completed

- Phase E site-wide correction foundation.
- Shared containment and native-control contract.
- Mobile popover and toast viewport safety.
- Very narrow dialog action fallback.
- Regression coverage and ownership documentation.

## Next phase

- Physical-device screenshot review.
- Workspace-by-workspace visual corrections based on rendered evidence.
- Final typography, spacing and interaction consistency pass.

## Pending external gates

- Clean dependency installation
- ESLint
- TypeScript compilation
- Next.js production build
- Browser and physical-device verification

# Implementation Status — v0.18.11

## Completed

- All manager workspace redesigns.
- All employee workspace redesigns.
- Login and employee activation redesigns.
- Dialogs, popovers, mobile sheets, form states, toast and shared state redesigns.
- iPhone native date/time/month/datetime containment across remaining forms.
- Phase D redesign inventory closed.

## Next phase

- Site-wide visual correction pass.
- Physical iPhone and iPad verification.
- Cross-workspace spacing, typography and interaction consistency corrections.

## Pending external gates

- Clean dependency installation
- ESLint
- TypeScript compilation
- Next.js production build
- Browser and physical-device verification

# Implementation Status — v0.18.10

## Completed

- Manager Requests workspace redesigned for iPhone-first review.
- Feature styling moved from legacy global selectors to `features/requests/RequestsWorkspace.module.css`.
- Request, claim and transfer API behavior preserved.
- Live refresh, manager decisions and stale-request conflict handling preserved.
- Focused source regression added.

## Pending external gates

- Clean dependency installation
- ESLint
- TypeScript compilation
- Next.js production build
- Browser and physical-device verification

## Current release: v0.18.9

Daily Operations and Settings have completed their Phase D iPhone-first redesign. The next planned workspace is the Employee Workspace.

# Implementation Status — v0.18.8

**Status:** Inventory and Purchase Orders redesign complete.

- Inventory and Orders now use locally scoped feature modules.
- Mobile views use contained one-column operational cards.
- Existing product, stock, supplier and order behavior is unchanged.

# Implementation Status — v0.18.7

**Status:** Dashboard and Shift Execution consistency pass complete.

- Today’s Operations now follows the accepted mobile density and card hierarchy.
- Shift Execution has a dedicated locally scoped CSS owner.
- Existing operational calculations and navigation paths remain unchanged.
