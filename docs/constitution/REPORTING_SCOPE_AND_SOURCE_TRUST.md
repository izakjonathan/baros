# Bar Ops — Reporting Scope and Source Trust Matrix

## Principle

Bar Ops should not expand into broad analytics until operational source data is trustworthy.

A report is production-ready only when:

- its source records are persisted;
- permissions are defined;
- corrections are auditable;
- overnight and timezone behaviour is verified;
- duplicate and stale records are handled;
- the report can be reconciled against source transactions.

## Current reporting scope

| Report | Current source foundations | Current confidence | Missing evidence before production report | Status |
|---|---|---|---|---|
| Hours worked | Timesheets, clock events, scheduled shifts, corrections, payroll periods | Medium | Live reconciliation, overnight/DST tests, correction audit review | Partially implemented through attendance/payroll |
| Attendance | Clock state, timesheets, attendance alerts, scheduled shifts | Medium | Absence rules, stale clock state, multi-role acceptance | Operational foundation exists |
| Lateness | Scheduled starts and actual clock-in data | Medium-low | Explicit lateness policy, grace periods, timezone tests, corrected-clock handling | Foundation exists; report deferred |
| Open shifts | Open shift records, claims, publication state | Medium | Claim conflicts, cancelled shifts, reporting date rules | Operational data exists |
| Stock movements | Product stock, adjustments, receipt transactions, audit records | Medium | Ledger reconciliation, concurrent receipt tests, manual adjustment reasons | Operational data exists |
| Orders | Purchase orders, items, receipts, suppliers, statuses | Medium | Partial/disputed receipt acceptance, cancellations, final-cost reconciliation | Operational data exists |
| Labour by week | Scheduled shifts, timesheets, employee role/cost metadata | Low-medium | Trusted cost rates, cross-midnight allocation, approved-timesheet rule, week/timezone definition | Deferred |
| Payroll export history | Payroll periods and export ledger | Medium-high in source | Live DB verification, exact export reconciliation, permission acceptance | Implemented foundation |

## Definitions that must be approved

### Hours worked

Recommended production definition:

- approved actual worked duration;
- minus approved unpaid breaks;
- allocated to the organization’s configured timezone;
- linked to the relevant payroll period;
- corrections reflected through auditable records.

Do not use scheduled hours as actual hours.

### Attendance

Attendance should distinguish:

- scheduled and present;
- clocked in late;
- absent;
- clocked without schedule;
- incomplete clock record;
- manually corrected;
- excused or approved exception.

### Lateness

The product must define:

- grace period;
- whether approved changes reset the scheduled start;
- whether manual clock corrections remove or annotate lateness;
- how overnight shifts are attributed.

### Open shifts

A report must distinguish:

- currently open;
- claimed and awaiting review;
- assigned;
- cancelled;
- published versus draft;
- unfilled at shift start.

### Stock movements

Every movement should identify:

- product;
- location;
- quantity;
- unit;
- direction;
- movement type;
- actor;
- timestamp;
- source record;
- reason where manual.

### Orders

Reports should distinguish:

- suggested quantity;
- submitted quantity;
- confirmed quantity;
- received quantity;
- disputed quantity;
- variance;
- estimated versus final cost.

### Labour by week

Do not implement a production labour-cost report until:

- employee cost fields are trusted;
- overtime and supplement rules are defined;
- approved actual hours are reliable;
- weekly timezone boundaries are explicit;
- cost allocation across midnight is defined.

## Deferred reporting boundary

The following remain outside the agreed near-term scope unless separately approved:

- broad forecasting dashboards;
- generic BI;
- customer analytics;
- sales attribution;
- profit prediction;
- cross-company benchmarking;
- automated staffing recommendations;
- large charting suites.

## Recommended verification order

1. hours and payroll reconciliation;
2. attendance and lateness;
3. open shifts;
4. stock movement ledger;
5. order and receipt reconciliation;
6. labour by week.

No report should be promoted solely because a UI card can display a calculated number.
