# v0.7.1 implementation status

## Implemented in this release
- Explicit, production-safe development authentication
- Login throttling
- Correct kiosk employee identification
- Scrypt kiosk PIN format and verification helper
- Atomic/idempotent payroll export
- Database-enforced payroll-period timesheet protection
- Atomic/idempotent schedule publication
- Shared API input validation foundation
- Security headers and CSP
- Direct migration connection support

## Migration note
Existing SHA-256 kiosk PIN values cannot be converted back into PINs. Reset each employee PIN through a future manager PIN editor or an administrative script so it is stored in the new `scrypt:salt:hash` format.

## Still staged
- Splitting the manager monolith into feature components
- Full schema validation on every legacy endpoint
- Composite organization foreign keys on every tenant relation
- Complete password-reset and MFA user flows
- Full Vitest/PostgreSQL/Playwright/Axe suite and CI
- Worker-based alert delivery and external monitoring

## v0.7.2 iPad/GitHub operations

Implemented:

- Manual GitHub Actions database migration, verification, and guarded seed operations.
- Neon database verification from GitHub without a local terminal.
- Automated regression and production-build checks for the `baros` repository.
- Repository-secret and optional GitHub Environment protection model.

Still external/configuration-dependent:

- The user must create Neon and add secrets to GitHub and Vercel.
- Vercel deployments still require the repository to be connected in the Vercel dashboard.
- GitHub Actions dependency installation depends on the public npm registry being available.
