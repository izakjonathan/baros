# Bar Ops v0.19.0-rc.3 — deployment sign-off

## Release status

**Status: pending external staging acceptance.**

The source package contains the acceptance contract and automated source checks. It is not production-approved until every mandatory technical gate and critical workflow in `STAGING_ACCEPTANCE.md` has passed on a deployed preview.

## Promotion decision

- Release candidate: `v0.19.0-rc.3`
- Application rollback checkpoint: `v0.18.16`
- Schema change in this release: none
- Production approver: ____________________
- Staging deployment URL: ____________________
- Commit/deployment ID: ____________________
- Acceptance completed at: ____________________
- Decision: [ ] Promote  [ ] Reject
- Notes: ____________________

## Promotion checks

1. Confirm the release artifact contains no generated output, dependency directory, deployment metadata, or secrets.
2. Confirm the staging deployment uses Node 24 and the intended environment variables.
3. Confirm database verification and readiness health checks pass.
4. Complete the manager, employee, device, browser and accessibility matrices.
5. Confirm there are no unresolved critical or high-severity defects.
6. Promote the exact tested deployment; do not rebuild from a different source state.
7. Perform the post-promotion smoke test in `DEPLOYMENT_ROLLBACK.md`.

## Rollback trigger

Roll back immediately for authentication failure, tenant/location leakage, lost or duplicated writes, incorrect payroll or stock mutation, broken shift publication, unavailable readiness endpoint, or any critical workflow regression.
