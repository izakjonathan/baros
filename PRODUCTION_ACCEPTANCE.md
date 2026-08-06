# Bar Ops production acceptance — v0.18.15

Run these gates from a clean checkout using Node 24:

1. `npm install --no-audit --no-fund`
2. `npm run audit:artifacts`
3. `npm run audit:preflight`
4. `npm run test:all`
5. `npm run lint`
6. `npm run typecheck`
7. `NODE_ENV=production DATABASE_URL=... APP_URL=https://... DEV_AUTH_ENABLED=false npm run validate:env`
8. `npm run build`
9. `npm run db:verify` against the intended production database
10. Deploy a preview and complete `V01814_DEVICE_ACCEPTANCE.md` on iPhone Safari

Production sign-off requires all ten gates. A source-level regression pass is not a substitute for the clean dependency-backed build or physical-device acceptance.
