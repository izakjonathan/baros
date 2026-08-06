# Bar Ops production acceptance — v0.18.16

This release turns the production-readiness contract into an auditable acceptance and sign-off workflow.

## Source and build gates

Run from a clean checkout with Node 24:

1. `npm install --no-audit --no-fund`
2. `npm run acceptance:source`
3. `npm run test:all`
4. `npm run lint`
5. `npm run typecheck`
6. `NODE_ENV=production DATABASE_URL=... APP_URL=https://... DEV_AUTH_ENABLED=false npm run validate:env`
7. `npm run build`
8. `npm run db:verify` against the staging database
9. Deploy the exact tested revision to staging
10. Complete `STAGING_ACCEPTANCE.md`, `V01814_DEVICE_ACCEPTANCE.md`, and `DEPLOYMENT_SIGNOFF.md`

Production sign-off requires all ten gates. A source-level regression pass, an untested ZIP, or a successful local build alone is not production acceptance.

## Current package status

The source-level release checks can run without installed dependencies. Clean installation, ESLint, full TypeScript validation, the Next.js production build, database verification, staging workflows, and physical-device testing remain external gates until executed in an environment with the required registry, database, deployment platform, and devices.
