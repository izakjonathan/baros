# Bar Ops — Master Development Brief

**Current confirmed baseline:** `v0.19.0-rc.53`  
**Baseline archive:** `bar-ops-v0.19.0-rc.53-local-font-build-reliability.zip`  
**SHA-256:** `4b1e1c5851a9f60e6f83587ee28387cf111be228d82f30645fb84d539392aec9`  
**Document date:** 2026-08-16  
**Status:** Current source of truth for agreed product scope and development direction

---

## 1. Product identity

Bar Ops is an operational application for real bar teams.

It must remain:

- practical;
- fast;
- role-aware;
- operationally clear;
- mobile-first where relevant;
- consistent across workspaces;
- dependable during real shifts;
- visually restrained rather than decorative;
- optimized for repeated daily use and fast decisions.

Intentional operational density is not a defect. Bar Ops must not be redesigned into a generic SaaS dashboard.

---

## 2. Current release status

`v0.19.0-rc.53` is the user-confirmed deployed technical baseline. It remains a **release candidate**, not a production-approved final release.

The baseline includes:

- the completed Phase D interface redesign;
- physical-device correction work through `v0.18.13.7`;
- accessibility and interaction foundations from `v0.18.14`;
- production-readiness documentation from `v0.18.15`;
- acceptance and deployment-signoff foundations from `v0.18.16`;
- controlled permission, integrity, CSS, workspace-ownership, release-contract, responsive-containment, and build-reliability remediation through `v0.19.0-rc.53`.

The confirmed baseline has passed Vercel dependency installation, Next.js production compilation, and deployment. The rc.54 candidate adds the first verified deterministic lockfile and clean dependency-backed local gate; it must still pass exact-artifact CI and Vercel promotion before becoming the confirmed baseline.

The following gates remain external and incomplete:

- live PostgreSQL migration and connectivity verification;
- multi-role acceptance;
- physical iPhone Safari verification;
- VoiceOver verification;
- backup and restore drill.

The project must remain an RC until those gates pass on the exact promoted source.

---

## 3. Implemented application surfaces

### Manager shell

The current manager application exposes:

- Today’s Operations;
- Shift Execution;
- Shift Plan;
- Time & Attendance;
- Inventory;
- Purchase Orders;
- Daily Operations;
- Team;
- Requests;
- Settings;
- Control Centre.

The manager shell is currently implemented as one large client application. This is an audited architectural risk, not permission to rewrite it broadly.

### Employee portal

The employee portal includes:

- home;
- published shifts;
- open-shift actions;
- shift acknowledgements;
- hours and clock state;
- timesheet correction requests;
- availability;
- time-off and related requests;
- notifications;
- mobile More navigation.

### Authentication and account foundations

The source includes:

- session-based authentication;
- hashed opaque session tokens;
- account activation;
- organization and location scope;
- server-side role checks;
- session expiry;
- development authentication controls;
- security and rate-limit foundations.

Password reset delivery, MFA, complete session administration, and managed recovery are not confirmed complete production workflows.

---

## 4. Operational modules

### Shift planning

Implemented foundations include:

- draft, published, and open shifts;
- employee and open-shift assignment;
- week navigation;
- schedule publishing;
- acknowledgements;
- recurrence and templates;
- conflict and availability checks;
- shift editing and deletion;
- overnight shifts;
- role-colored shift cards;
- mobile horizontal day columns.

Draft shifts intentionally use muted presentation and dotted borders without a `DRAFT` pill.

### Attendance and hours

Implemented foundations include:

- clock in and clock out;
- scheduled versus actual hours;
- timesheets;
- manager corrections;
- employee correction requests;
- approval state;
- payroll periods;
- payroll locks;
- payroll exports;
- audit records;
- lateness and attendance alerts.

Cross-midnight work is an explicit domain requirement. DST and concurrency behaviour still require runtime verification.

### Inventory and ordering

Implemented foundations include:

- products;
- current stock;
- par and reorder values;
- stock adjustments and movement history;
- suppliers;
- order suggestions;
- purchase orders;
- receiving;
- partial and disputed receipt foundations;
- stock transaction records;
- cost and sale-price fields;
- tenant-scoped mutation routes.

Suggested, entered, ordered, received, and variance values must remain clearly distinguishable.

### Daily operations

Implemented foundations include:

- opening, closing, task, and maintenance checklist items;
- presets;
- owner and due labels;
- completion tracking;
- manager handovers and operational logbook information;
- current-day operational summaries.

### Team and employee access

Implemented foundations include:

- employee records;
- employment roles;
- account linking;
- invitations;
- activation;
- active/inactive state;
- portal access state;
- upcoming scheduled-hour summaries.

### Requests and self-service

Implemented foundations include:

- time-off requests;
- availability;
- open-shift claims;
- shift changes and transfers;
- manager review;
- status and conflict handling;
- employee history.

---

## 5. Role model

The authenticated account roles currently defined in source are:

- `OWNER`
- `ADMIN`
- `MANAGER`
- `SHIFT_MANAGER`
- `EMPLOYEE`

`BARTENDER` is not a top-level authentication role. It is an employment or shift assignment role and normally uses the employee portal.

The detailed observed and intended capability model is recorded in `ROLE_CAPABILITY_MATRIX.md`.

---

## 6. Product and interface decisions to preserve

Preserve:

- operational density;
- mobile-first manager and employee use;
- compact, fast actions;
- restrained motion;
- black/beige foundation with functional role and module colors;
- no shadows, gradients, glow, or decorative effects;
- content-driven card colors;
- horizontally scrollable Shift Plan columns on phones;
- draft styling through muted presentation and dotted outline;
- native date-picker functionality with a component-owned visible label where required by iOS;
- iPhone safe-area and dynamic-viewport handling;
- feature-specific mobile layouts where global rules would harm the workflow;
- narrow reporting scope until data trust is proven.

The complete decision register is in `INTENTIONAL_EXCEPTION_REGISTER.md`.

---

## 7. Engineering rules for future changes

Every remediation or feature task must:

1. inspect the rendered component, parent layout, global CSS, feature CSS, responsive rules, inline styles, and state-driven classes;
2. identify the owning rule or mechanism;
3. correct the source rather than add an opposite compensating rule;
4. make the smallest reliable change;
5. preserve unrelated working systems;
6. document intentional browser workarounds;
7. add risk-focused regression coverage;
8. distinguish source checks from runtime verification;
9. avoid broad refactoring during visual fixes;
10. avoid visual redesign during security or data-integrity work.

---

## 8. Current architectural findings

The following are current audit findings and should drive planned remediation:

- `components/bar-ops-app.tsx` remains the state and coordination owner, while manager workspace rendering and dialogs are now feature-owned.
- CSS is consolidated to global tokens, one global stylesheet, and the Shift Plan module; this three-owner contract must remain protected.
- server authorization is generally stronger than UI capability filtering.
- role arrays and operational status strings are duplicated.
- API runtime validation is strong in some routes and inconsistent in others.
- the regression suite contains many useful source contracts but too few runtime and browser tests.
- release documentation still contains historical provenance documents that must not be mistaken for the current baseline.
- rc.54 introduces deterministic installation, but exact-artifact CI and runtime acceptance remain required.

These findings do not justify a rewrite. They require controlled, phased remediation.

---

## 9. Deferred scope

### Reporting

The agreed small reporting scope is:

- hours worked;
- attendance;
- lateness;
- open shifts;
- stock movements;
- orders;
- labour by week.

Broad analytics, forecasting expansion, and generic BI dashboards remain deferred until operational data integrity is verified.

### Production capabilities

The following are not assumed complete merely because foundations exist:

- live email delivery;
- complete password-reset workflow;
- MFA;
- complete session-revocation administration;
- managed database backup/restore;
- production monitoring and alerting;
- confirmed kiosk product experience;
- production-grade privacy export/deletion workflow.

---

## 10. Approved remediation sequence

### Phase A — Documentation and baseline integrity

Completed as the documentation foundation. Current work must use the later confirmed baseline named at the top of this brief.

### Phase B — Permissions, security, and data integrity

After explicit approval:

- central capability model;
- UI/server parity;
- tenant-negative tests;
- concurrency tests;
- migration and recovery verification;
- minimum production authentication scope.

### Phase C — Low-risk code and CSS hygiene

After Phase B evidence:

- typed API contracts;
- localized `any` removal;
- dead selector cleanup;
- duplicate constant consolidation;
- lockfile and deterministic CI.

### Phase D — Workspace and UI consistency

Only through small releases:

- canonical primitives;
- CSS ownership;
- status consistency;
- role-aware action presentation;
- automated viewport coverage.

### Phase E — Architecture and data flow

One domain at a time. Scheduling last.

### Phase F — Runtime testing, accessibility, and performance

- seeded integration tests;
- browser workflows;
- visual regression;
- VoiceOver and Safari acceptance;
- bundle and rerender profiling;
- exact-artifact staging promotion.

---

## 11. Baseline continuation rule

All future work must start from the exact baseline named in the active approved brief or from a later version explicitly confirmed by the user.

A release is not considered a new working baseline merely because a ZIP was generated. It becomes the baseline only after:

- scope is confirmed;
- required checks are honestly recorded;
- the user accepts it or explicitly continues from it.

---

## 12. Approved role decisions

The following product decisions are now approved and binding for Phase B:

1. `SHIFT_MANAGER` is an **operational shift lead**, not a full location manager.
2. Managers may use the employee portal when they are linked to an employee profile.
3. `OWNER` and `ADMIN` remain equivalent in capability and governance scope.

Phase B may now align the UI, server capability model, documentation, and tests to these decisions.
