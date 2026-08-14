# Testing

`npm run test:current` is the active regression gate. It covers current business logic, payroll, integrity, production foundations, inventory/operations, security remediation, authentication, tenant isolation, transaction/API boundaries, type-safety contracts, release contracts and the current CSS/UI architecture.

The active command groups are intentionally small:

- `test:logic`
- `test:payroll`
- `test:integrity`
- `test:production`
- `test:inventory`
- `test:remediation`
- `test:auth`
- `test:boundaries`
- `test:release-contract`
- `test:ui`
- `test:current`

Historical release-specific test scripts are no longer shipped in the active repository. Previous ZIP releases and Git history remain the historical record. A superseded source-text test must not force obsolete implementation code to remain in production.

The rc.38 CSS gate protects the three-file CSS architecture. The rc.41 gate protects CSS/source ownership, shared page/dialog/state/header contracts and Shift Plan-only custom CSS. The rc.42 gate protects the three global card fundamentals. The rc.43 gate protects the compact repository/test surface, fixed shared topbar, and Shift Plan scroll containment.

Vercel/GitHub Actions are the dependency-backed production gates for lint, TypeScript and Next.js build validation when local `node_modules` are unavailable.
