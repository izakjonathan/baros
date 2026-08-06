# v0.19.0-rc.3 defect status

No defect may be closed solely from source inspection when it requires authenticated runtime, live PostgreSQL, concurrency, Safari, or staging evidence.

Known pending product scope: the employee workspace has not yet been redesigned.

# Bar Ops v0.19.0-rc.2 — release-candidate defect log

Record every staging or device defect before promotion.

| ID | Severity | Route / workflow | Role / location | Steps | Expected | Actual | Evidence | Resolution release | Status |
|---|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — | — | No defects recorded yet |

## Severity contract

- **Critical:** security, tenant leakage, authentication outage, corrupt/lost/duplicated writes, incorrect payroll or stock mutation, or complete critical-workflow failure. Immediate rollback; promotion blocked.
- **High:** major workflow unusable without a safe workaround. Promotion blocked.
- **Medium:** material defect with a safe workaround. Requires explicit acceptance or a later candidate.
- **Low:** cosmetic or minor usability issue that does not compromise correctness.
