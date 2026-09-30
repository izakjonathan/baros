# Operation verification

Run before every release:

```bash
npm run test:all
npm run lint
npm run typecheck
NODE_ENV=production DATABASE_URL=postgresql://ci:ci@localhost:5432/barops APP_URL=https://barops.example DEV_AUTH_ENABLED=false npm run validate:env
npm run build
```

`test:operation` protects the established Operation behavior. `test:operation-only` prevents deleted product routes from returning and verifies the owner invitation contract.

After migration 025 is deployed, complete these manual production checks:

1. Owner signs in and lands on `/operation`.
2. Owner creates each role invitation and copies its link.
3. Invitation activates once, rejects reuse, and signs the new account into `/operation`.
4. Manager and Employee accounts see their intended Operation permissions.
5. Shared staff link works without Vercel or application login.
6. Disabled and rotated shared links stop working.
7. Legacy URLs such as `/employee`, `/api/shifts`, and `/api/orders` return 404.
