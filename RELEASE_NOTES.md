# Bar Ops v0.7.4 — Employee access and persistence hardening

This release remediates the highest-priority findings from the v0.7.3 full-code audit.

## Implemented

- Employee kiosk PINs created or changed through the employee API now use the salted scrypt format expected by kiosk verification.
- Employee create/update routes now validate request size, names, email addresses, IDs, numeric payroll fields and location tenancy.
- Employee creation, location assignment and audit logging are committed in one transaction.
- Employee updates and their audit records are committed in one transaction.
- Existing Bar Ops users accepting another organization invitation keep their existing password. They authenticate with that password instead of having it overwritten.
- New users still create a password during activation.
- Expired invitations are normalized to an EXPIRED state when portal status is loaded.
- Production invitation creation now requires a valid APP_URL before the invitation is inserted.
- Managers can revoke pending employee invitations from Team.
- iPad share cancellation no longer reports invitation failure. Clipboard and visible-link fallbacks are provided.
- Employee UI updates use immutable employee IDs rather than names.
- Employee and product success notifications now wait for the persistent API response.
- Recurring shift creation is transactional, preventing partially created series.
- Recurrence edits for one/future/all preserve relative occurrence offsets and are committed transactionally.
- Shift IDs, dates, durations, recurrence limits and employee/location tenancy receive stronger validation.
- Added `npm run test:hardening` and included it in `npm run test:all`.

## No migration required

v0.7.4 uses the schema introduced through migration 007. After committing this release, the normal GitHub Quality Checks workflow is sufficient. Running database Verify is optional; Migrate is not required for this version.

## Still staged

- Full decomposition of the large manager component and global stylesheet.
- Shared validation conversion for every legacy endpoint.
- Complete composite tenant foreign-key enforcement.
- Finished automated email delivery, MFA and password-reset UI.
- Browser, accessibility and real PostgreSQL integration suites.
