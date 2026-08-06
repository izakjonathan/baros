# Bar Ops — Approved Role Decisions

**Date:** 2026-08-06  
**Applies from:** Phase B permission and data-integrity remediation

## Approved decisions

1. `SHIFT_MANAGER` is an operational shift lead.
2. Managers may use the employee portal when linked to an employee profile.
3. `OWNER` and `ADMIN` remain equivalent.

## Phase B implications

- Introduce one centralized capability model.
- Preserve server-side enforcement as authoritative.
- Filter manager navigation and actions by capability.
- Keep the employee portal available to linked manager accounts.
- Ensure employee self-service APIs remain scoped to the linked employee identity.
- Treat Owner and Admin as the same capability tier.
- Add direct URL, direct API, and multi-role regression tests.
