# Bar Ops v0.16.15.1 — Order Route TypeScript Hotfix

Built from the approved v0.16.15 Production Hardening XV & XVI baseline.

- Fixed typed SQL-template parameters in `app/api/orders/route.ts`.
- Validates order number, status, delivery date, notes and item-array shape before the transaction.
- Preserves tenant-scope enforcement and atomic audit writes.
- No migration, permission, API or workflow change.

---

# Bar Ops v0.16.15 — Production Hardening XV & XVI

Built from the approved v0.16.13 Production Hardening XIII & XIV baseline.

## v0.16.14 — Authorization & Tenant Scope Integrity

- Added shared organization-location and organization-entity scope guards.
- Purchase-order creation now verifies the selected location belongs to the authenticated organization.
- Purchase-order suppliers and products must belong to the same authenticated organization.
- Payroll-period creation now verifies its selected location belongs to the authenticated organization.
- Cross-organization identifiers are rejected before any write occurs.
- Existing role permissions remain unchanged.

## v0.16.15 — Transaction Integrity

- Purchase-order creation, line-item insertion and its audit record now run in one database transaction.
- Payroll-period creation/status transitions and their audit records now run in one database transaction.
- A failed validation or audit write now rolls back the complete affected mutation.
- Added bounded order-item input validation and a maximum of 250 submitted lines.
- Replaced direct unbounded JSON parsing in the affected routes with the shared bounded parser.

## Compatibility

- No database migration.
- No permission or role changes.
- No new business features.
- No route removal or intentional successful-response break.
