# Bar Ops v0.10.8 — Baseline Audit and Verification

Built directly from `bar-ops-v0.10.7-employee-workspace-integrity.zip`.

## Purpose

Audit and document the current baseline without changing application behavior.

## Added

- SHA-256 baseline manifest for v0.10.7
- Classified repository inventory
- Full v0.10.8 audit report
- Functional verification matrix
- Validation log
- Audit-package regression check

## Application changes

None. Routes, UI behavior, database migrations and business logic are unchanged from v0.10.7.

## Outcome

All included source-level regression suites pass. Reproducible dependency installation, a production build, fresh PostgreSQL execution and browser verification remain open gates.
