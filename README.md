# Bar Ops v0.18.8 — Inventory & Orders Redesign

Current release: **v0.18.8**

This release rebuilds Inventory and Purchase Orders as iPhone-first operational workspaces. Stock controls, low-stock filtering, product details, replenishment suggestions, deliveries and order statuses are presented as compact feature-owned cards rather than desktop tables. Existing stock calculations, supplier data, adjustments, receiving behavior, permissions, APIs and persistence remain unchanged.

Rollback checkpoint: **v0.18.7**.

# Bar Ops v0.18.6 — Team Redesign

Historic release: **v0.18.6**

This release rebuilds the Team workspace as a compact iPhone-first people-management view. Team totals, search, filtering, employee identity, scheduled hours, contact details, portal access and employee actions are reorganized into a denser operational hierarchy while preserving all existing employee behavior.

Rollback checkpoint: **v0.18.5.3**.

# Bar Ops v0.18.5.3 — Time & Attendance Layout Polish

Historic release: **v0.18.5.3**

This patch fixes the recurring iPhone Safari overflow of the paired From and To native date controls in Time & Attendance. The correction is applied at the sizing source: shrinkable grid tracks, shrinkable labels, bounded date inputs, and WebKit-specific date-edit containment. The reusable solution is documented and protected by a regression test.

Rollback checkpoint: **v0.18.5.2**.

---

# Bar Ops v0.18.4.23 — Independent Day Column Repair

Historic release: **v0.18.4.23**

This release structurally isolates every schedule day into its own fixed-width column so neon headers, role-colored shifts, and Add shift actions can no longer merge across neighboring days. Horizontal touch scrolling remains available without a visible scrollbar.

Rollback checkpoint: **v0.18.4.22**.

---

# Bar Ops v0.18.4.19 — Shift Plan Neon Header Fill Polish

Historic release: **v0.18.4.19**

This release focuses the next Shift Plan visual pass on the weekly schedule grid. Day header cells now use the neon fill consistently, remain visually separate as rounded cards, and sit above a black schedule body. Shift cards are reduced further in size and typography so the weekly overview feels lighter and more deliberate while preserving role-based color coding.

Rollback checkpoint: **v0.18.4.18**.

# Bar Ops v0.18.4.14.1 — Quality Check Ordering Hotfix

Historic release: **v0.18.4.14.1**

This hotfix separates release-package artifact validation from dependency-based quality checks. GitHub Actions now checks for forbidden packaged artifacts before `npm install` creates `node_modules`, then installs dependencies and runs the existing stabilization, regression, lint, type-check, environment and production-build gates.

**Required one-time repository cleanup:** delete the existing root `vercel.json` from the GitHub repository. It is not present in this release ZIP, but ZIP-based commit tools may preserve files that are absent from an uploaded archive. Until the tracked file is deleted, both the artifact audit and Vercel repository state remain incorrect.

Rollback checkpoint: **v0.18.4.14**.

# Bar Ops v0.18.4.14 — Single-Owner Page Flow

Historic release: **v0.18.4.14**

This release removes stacked external spacing by introducing one canonical workspace flow owner. Each top-level workspace section now contributes zero external margin; the parent flow gap is the only source of vertical spacing. Nested card grids use the same gap for rows and columns. Internal component padding remains unchanged.

Rollback checkpoint: **v0.18.4.13**.

# Bar Ops v0.18.4.13 — Spacing Ownership Cleanup

Historic release: **v0.18.4.13**

This release makes the existing 8px external grid authoritative across the full CSS cascade. Canonical page gutters, section gaps, card-grid gaps, top-bar alignment and background-title rhythm are now owned by a final-loaded stylesheet. Internal component padding remains independent.

Rollback checkpoint: **v0.18.4.12**.

# Bar Ops v0.18.4.12 — Compact External Grid

Historic release: **v0.18.4.12**

This focused Phase D refinement reduces the unified external layout grid from 16px to 8px. Page gutters, section separation, card-grid gaps and spacing around titles sitting on the page background now use the smaller value consistently. Internal card padding is deliberately unchanged.

Rollback checkpoint: **v0.18.4.11**.

# Bar Ops v0.18.4.11 — Unified Grid Spacing System

Historic release: **v0.18.4.11**

Built from the approved v0.18.4.10 baseline. This release introduces one site-wide external layout token for page gutters, section spacing, card-grid gaps and background-level title rhythm. Internal card padding remains independently controlled.

Rollback checkpoint: **v0.18.4.10**.

# Bar Ops v0.18.4.10 — Reference Red & Stable Top Bar

Historic release: **v0.18.4.10**

This focused visual hotfix changes the red-orange design token to the sampled reference color `#EB6746` and gives the manager top bar one stable safe-area owner. The top bar now sits below the iOS status area from first paint, while the page shell reserves the same combined height, preventing the initial oversized gap and upward jump when Safari begins scrolling.

Rollback checkpoint: **v0.18.4.9**.

# Bar Ops v0.18.4.9 — Palette & Spacing Alignment

Historic release: **v0.18.4.9**

This release updates the approved functional palette, fixes the manager top bar in place, distributes colour across its controls, and tightens the shared page gutters and section spacing visible in the mobile screenshots.

Rollback checkpoint: **v0.18.4.8**.

# Bar Ops v0.18.4.8 — Mobile Layout Repair

Historic release: **v0.18.4.8**

This focused repair release rebuilds the mobile structure of Time & Attendance and contains the Shift Plan controls outside the horizontally scrolling calendar. Attendance filters, empty states, result cards and payroll previews now stay within the viewport in both light and dark modes. Shift Plan navigation, acknowledgement, conflict and publication controls are contained without changing the calendar's intentional horizontal scrolling.

Rollback checkpoint: **v0.18.4.7**.

# Bar Ops v0.18.4.7 — Dark Mode & Structural Card Refinement

Historic release: **v0.18.4.7**

This focused Phase D release adds a persistent light/dark theme switch and corrects the visible structural problems in the latest mobile screenshots. Dark mode uses a black application canvas with beige neutral content surfaces while preserving the approved functional colors. Card geometry is firmer, leading metric icons are removed, titles are larger, and Time & Attendance plus Shift Plan receive the deepest refinement.

Rollback checkpoint: **v0.18.4.6**.

# Bar Ops v0.18.4.6 — Mobile Density & Responsive Structure

Historic release: **v0.18.4.6**

This release tightens mobile density and converts Time & Attendance from a desktop table squeezed onto mobile into a responsive card-based workflow. It also reduces the persistent top-bar height, replaces the unapproved location gradient with solid pink, restores Team’s editorial title composition, standardizes disabled controls, and removes remaining low-contrast legacy state colors from the refined screens.

Rollback checkpoint: **v0.18.4.5**.

# Bar Ops v0.18.4.5 — Top Bar & Attendance Refinement

Historic release: **v0.18.4.5**

This release refines the manager top bar and the Time & attendance workspace after the first colour-architecture pass. The persistent top bar now removes the bottom rule, uses the approved rounded black control treatment for menu/search/notification actions, and gives the location switcher a stronger gradient pill treatment based on the supplied references. Time & attendance now receives its own editorial header and functional colour surfaces so it no longer drops back into a flat beige composition.

Rollback checkpoint: **v0.18.4.4**.

# Bar Ops v0.18.4.4 — Color Architecture & Page Composition

Historic release: **v0.18.4.4**

This Phase D correction rebalances the application away from beige outline-only composition. Major workspace introductions now use approved editorial colour blocks, functional sections use pink, orange, blue, neon and black deliberately, and repeated nested borders have been reduced. Team, Shift Plan, Shift Execution and Dashboard retain their existing workflows and data behavior.

# Bar Ops v0.18.2 — Dashboard & Overview Redesign

Phase D dashboard redesign built from v0.18.2. It introduces a feature-owned dashboard CSS Module, stronger operational hierarchy, responsive KPI layouts, a prominent live shift board, structured attention and timeline panels, an inverse operational summary, and clearer quick actions. Existing calculations, API requests, role access and navigation targets are unchanged. No migration is required.

# Bar Ops v0.18.2

This release creates a safer foundation for Phase D by extracting shared workspace domain contracts and pure schedule logic from the manager application shell, documenting stable redesign boundaries, and adding a complete cross-workspace redesign inventory.

No database migration, permission change, business feature, API contract change, workflow change, or intentional visual redesign is introduced.

Rollback checkpoint: **v0.16.21.3**.

Hospitality operations system built with Next.js, TypeScript and PostgreSQL for Vercel and Neon.

## Phase D in progress

This combined build establishes the layered design-system foundation and redesigns the manager and employee application shells/navigation. Workspace content remains intentionally unchanged until its planned Phase D release.

## Architecture foundation

- Workspace domain contracts live in `features/workspace/types.ts`.
- Pure date, conflict, overnight and database-shift mapping logic lives in `features/workspace/schedule-utils.ts`.
- Shared interaction primitives remain in `components/ui/`.
- Current visual tokens remain centralized in `app/mono-tokens.css` and form the controlled entry point for Phase D.
- Stable redesign boundaries are documented in `docs/architecture.md`.
- Manager, employee, component and state coverage is listed in `docs/redesign-inventory.md`.

## Phase D boundary

Phase D may change visual hierarchy, typography, tokens, component presentation, responsive composition and motion. It must preserve routes, API contracts, role permissions, tenant isolation, persisted data and workflow semantics unless separately approved.

## Validation

Use the consolidated gates:

```bash
npm run audit:preflight
npm run validate:release
npm run test:all
npm run lint
npm run typecheck
npm run build
```

## Database

Use `DATABASE_URL` for the pooled Neon runtime URL and `DATABASE_DIRECT_URL` for migrations.

## Production health checks

- `GET /api/health/live` checks application liveness without requiring the database.
- `GET /api/health/ready` checks bounded database readiness and reports duration.
- `GET /api/health` remains a backwards-compatible readiness alias.

## Installed app

The web app manifest, Apple metadata, icons and `public/sw.js` remain included. The service worker does not cache authenticated API responses or operational pages.
