# Bar Ops — Phase A Documentation Alignment

**Phase:** A — Documentation and baseline integrity  
**Baseline:** `bar-ops-v0.19.0-rc.1-production-release-candidate.zip`  
**Baseline SHA-256:** `400d617764231bea3525294f7bf989c21797505f87c644e6dc8910ee3a3cffe6`  
**Status:** Documentation alignment only  
**Application code changed:** No  
**Release ZIP created:** No

## Purpose

This documentation set establishes one current source of truth before any Constitution remediation changes are approved.

It does not certify production readiness and does not replace the full audit. It records:

1. the current product and engineering baseline;
2. the current role and capability model;
3. intentional Bar Ops-specific exceptions;
4. current and deferred reporting scope;
5. release and baseline integrity requirements.

## Authority order

For future Bar Ops work, apply instructions in this order:

1. explicit user instructions for the current task;
2. `MASTER_DEVELOPMENT_BRIEF.md`;
3. `ROLE_CAPABILITY_MATRIX.md` for access decisions;
4. `INTENTIONAL_EXCEPTION_REGISTER.md`;
5. the Bar Ops Constitution chapter;
6. the general Project Development Constitution;
7. generic framework guidance.

The source code remains authoritative for what is currently implemented. These documents describe the intended product direction and identify decisions that remain unresolved.

## Documents

- `MASTER_DEVELOPMENT_BRIEF.md`
- `ROLE_CAPABILITY_MATRIX.md`
- `INTENTIONAL_EXCEPTION_REGISTER.md`
- `REPORTING_SCOPE_AND_SOURCE_TRUST.md`
- `BASELINE_AND_RELEASE_INTEGRITY.md`

## Approved decisions for permission remediation

- `SHIFT_MANAGER` is an operational shift lead and should not receive organization-level employee, payroll-locking, export-creation, persistent-template, settings, or security administration capabilities.
- Managers may intentionally enter the employee portal when linked to an employee profile.
- `OWNER` and `ADMIN` remain equivalent in capability and governance scope.

Phase B may proceed using these decisions as binding product rules.
- Whether kiosk functionality is launch scope or foundation-only scope.
- Which authentication capabilities are required before production: password reset, session revocation UI, MFA, and managed recovery.
