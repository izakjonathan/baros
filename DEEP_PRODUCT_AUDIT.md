# Bar Ops v0.5.0 — Deep product audit

## Audit scope

This release audits the product as a hospitality operating system rather than a collection of screens. The review covers scheduling, attendance, payroll handoff, employee self-service, inventory, ordering, multi-location architecture, accessibility, responsive behavior, error prevention, data integrity, security, and operational scalability.

## Benchmark set

The audit compared current workflows and public product documentation from Planday, Deputy, 7shifts, When I Work, Homebase, Connecteam, MarketMan, Restaurant365, TitanPlan, Salesforce platform patterns, and established mobile/web accessibility guidance.

## Changes implemented in v0.5.0

### Time and attendance

- Added status filter and a default “Needs review” queue.
- Added exception detection for substantial scheduled/actual variance, no recorded break, and manager-edited records.
- Added edit/correction workflow with a mandatory correction reason.
- Corrected records return to Pending rather than remaining silently approved.
- Added Reject and Reopen workflows.
- Approved records can be reopened and are immediately excluded from future exports.
- Added an export history panel for payroll files generated during the current development session.
- Preserved the approved-only export boundary.
- Improved action labels, visual hierarchy, table density, and mobile behavior.

### Design system and layout

- Consolidated content width, control height, radius, and minimum touch target tokens.
- Added visible keyboard focus styling.
- Added reduced-motion behavior.
- Added responsive breakpoints for tablet, compact desktop, mobile, and very narrow devices.
- Changed page headers and action groups to stack safely instead of overflowing.
- Made metric, team, inventory, and quick-action grids degrade predictably from four to two to one column.
- Made attendance filters responsive from four columns to two to one.
- Kept data-heavy tables horizontally scrollable instead of squeezing content into unreadable cells.
- Enforced single-column mobile forms and safer dialog viewport bounds.
- Increased calendar and shift-card tap reliability.
- Improved safe-area handling and minimum 44px interaction targets.

### Quality assurance

- Added `npm run test:audit`.
- Retained scheduling and payroll regression suites.
- Added source assertions for correction, reopening, rejection, exception detection, export history, focus visibility, reduced motion, and responsive filters/forms.

## Critical gaps before production

### P0 — Data integrity and security

1. Connect every manager module to PostgreSQL; local React state is not production-safe.
2. Add optimistic concurrency/version columns to shifts, orders, inventory counts, and timesheets.
3. Introduce fine-grained permissions such as schedule.publish, timesheet.approve, payroll.export, employee.edit-pay-rate.
4. Add immutable before/after audit records for all payroll-affecting edits.
5. Add closed pay periods and hard export locks.
6. Add idempotency keys to clock, order, and approval mutations.
7. Add rate limiting, CSRF strategy, security headers, session/device management, password reset, and optional MFA.
8. Add automated PostgreSQL backups, restore drills, error monitoring, and structured logs.

### P1 — Scheduling completeness

1. Drag-and-drop and keyboard-accessible shift movement.
2. “This occurrence / this and future / entire series” recurrence editing.
3. Shift templates and named schedule templates.
4. Coverage requirements by role and time interval.
5. Conflict warnings for availability, approved leave, overlapping shifts, skills, minimum rest, maximum weekly hours, and overtime.
6. Labour cost preview while scheduling, including wage rates and supplements.
7. Publish/change notifications and employee acknowledgement.
8. Schedule version history, compare, restore, print, and export.
9. Unfilled/open-shift request ranking and eligibility rules.
10. Call-out and absence workflow distinct from planned leave.

### P1 — Attendance and payroll

1. Kiosk mode with employee PIN and venue device registration.
2. Optional geofence/location verification with privacy controls.
3. Early/late/missed punch alerts and automatic manager inbox items.
4. Employee correction requests and attestation.
5. Paid/unpaid break types, break waiver records, and configurable rounding.
6. Overtime, evening/night/weekend/public-holiday supplements.
7. Payroll identifiers, departments, cost centres, salary codes, and configurable export mappings.
8. Manual timesheets, split shifts, multiple breaks, and cross-location work.
9. Approval permissions and dual approval for sensitive pay changes.
10. Export ledger with checksum, creator, timestamp, file format, included record IDs, and re-download.

### P1 — Employee records

1. Stable employee IDs independent of names.
2. Employment start/end dates, contract type, contracted hours, wage/rate history, and location memberships.
3. Skills, certificates, expiration dates, training, emergency contact, documents, and GDPR retention rules.
4. Invite/onboarding workflow and account status separate from employment status.
5. PTO balances, accrual policies, absence categories, and calendar visibility rules.

### P1 — Inventory and procurement

1. Transaction ledger rather than directly mutating current stock.
2. Count sessions with draft/submitted/approved states and variance sign-off.
3. Supplier catalogue, supplier SKU, pack size, unit conversions, lead time, minimum order, and delivery schedule.
4. Purchase-order line editor, approval thresholds, send history, partial receipt, discrepancy, credit note, and invoice matching.
5. Waste/spoilage/comp logging with reasons and cost impact.
6. Transfers between locations.
7. Recipe/BOM depletion and POS-linked theoretical versus actual usage.
8. Price history, recipe/menu costing, COGS, stock value snapshots, and demand forecasting.

### P2 — Hospitality operations

1. Opening/closing and role-specific checklists.
2. Task assignment, recurrence, evidence/photo, and completion audit.
3. Manager logbook and shift handover notes.
4. Equipment register, manuals, fault reports, planned maintenance, service vendors, and warranty.
5. Delivery calendar and receiving workflow.
6. Events connected to expected guests, staffing requirements, stock demand, and task templates.
7. Team messaging, announcements, read receipts, and targeted notifications.
8. Tip pooling/distribution and payroll handoff.
9. POS, payroll, accounting, supplier, and identity-provider integrations.

## Product architecture recommendation

Keep the current modular domain direction, but move toward explicit domain services and event records:

- Identity and access
- Organisations and locations
- People and employment
- Scheduling and availability
- Attendance and payroll handoff
- Inventory ledger
- Procurement and receiving
- Tasks and operations
- Equipment and maintenance
- Events and forecasting
- Communications and notifications
- Audit, reporting, and integrations

Every write should carry organisation ID, location ID when relevant, actor ID, source, request/idempotency ID, and timestamp. Payroll, stock, and schedule publication events should be append-only or fully versioned.

## UX principles established

1. Show operational exceptions before raw data.
2. Make irreversible actions explicit and reversible where legally/operationally safe.
3. Preserve source records when a manager corrects derived records.
4. Never hide whether a number is scheduled, recorded, approved, exported, or paid.
5. Keep mobile actions within one thumb reach and a minimum 44px target.
6. Use progressive disclosure: summary first, detail and audit trail on demand.
7. Prefer dedicated workflows over overloaded generic forms.
8. Maintain a consistent scale across every module, not page-specific sizing patches.
