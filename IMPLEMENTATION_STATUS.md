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
