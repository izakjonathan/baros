# Bar Ops — Approved Role Decisions

**Date:** 2026-08-06

**Applies from:** Phase B permission and data-integrity remediation

**Implementation status:** Central capability model, manager UI filtering, and planned direct-route parity implemented through `v0.19.0-rc.56`; live multi-role acceptance remains external.

## Approved decisions

1. `SHIFT_MANAGER` is an operational shift lead.
2. Managers may use the employee portal when linked to an employee profile.
3. `OWNER` and `ADMIN` remain equivalent.

## Phase B implications

- Maintain one centralized capability model.
- Preserve server-side enforcement as authoritative.
- Keep manager navigation and actions filtered by capability.
- Keep the employee portal available to linked manager accounts.
- Keep employee self-service APIs scoped to the linked employee identity.
- Treat Owner and Admin as the same capability tier.
- Retain the executable all-role capability matrix and complete live direct-URL/API acceptance before final release.
