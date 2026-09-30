# Bar Ops — Operation

Current release: **v0.19.0-rc.128**

This repository now contains only the focused Operation product:

- `/login` — account sign-in
- `/activate/[token]` — single-use account activation
- `/operation` — authenticated Home, Handbook, Tasks, Reminders and Count
- `/operation/public/[accessToken]` — shared staff access with employee-level permissions

The former scheduling, attendance, inventory, ordering, payroll and employee-portal routes have been removed from the deployed application. Their historical database migrations remain intentionally preserved so existing production data can be extracted safely into a future repository.

## Owner settings

Owners can open Operation Settings to:

- manage the Operation color system;
- create Owner, Manager or Employee invitations;
- copy or revoke pending activation links;
- enable, disable or rotate the shared staff link;
- reset Count or Reminder history independently;
- sign out.

Invitation links expire after seven days, are single-use, and are stored only as SHA-256 hashes. Run migration `025_operation_user_invitations.sql` before using Add user.

## Local development

```bash
npm ci
npm run db:migrate
npm run dev
```

Required production variables:

- `DATABASE_URL`
- `DATABASE_DIRECT_URL` for migrations
- `APP_URL`
- `BLOB_READ_WRITE_TOKEN` for image upload

## Verification

```bash
npm run test:all
npm run lint
npm run typecheck
npm run validate:env
npm run build
```

Rollback checkpoint: **v0.19.0-rc.127**.
