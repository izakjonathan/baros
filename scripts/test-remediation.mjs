import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const checks=[
 ['dev auth is explicit',read('lib/auth/dev-auth.ts').includes('DEV_AUTH_ENABLED === "true"')&&!read('lib/auth/dev-auth.ts').includes('return !process.env.DATABASE_URL')],
 ['no automatic owner session',!read('lib/auth/session.ts').includes('getAutomaticDevUser')],
 ['kiosk identifies employee',read('app/api/kiosk/route.ts').includes("employeeId=uuid")],
 ['kiosk uses scrypt',read('lib/security/kiosk-pin.ts').includes('scrypt:')],
 ['login throttled',read('app/api/auth/login/route.ts').includes('enforceRateLimit')],
 ['payroll export atomic',read('app/api/payroll-exports/route.ts').includes('db().begin')&&read('app/api/payroll-exports/route.ts').includes('for update')],
 ['payroll export unique',read('db/migrations/006_integrity_remediation.sql').includes('payroll_exports_one_per_period_uq')],
 ['timesheet database guard',read('db/migrations/006_integrity_remediation.sql').includes('timesheets_locked_period_guard')],
 ['schedule publication atomic/idempotent',read('app/api/schedule-publish/route.ts').includes('pg_advisory_xact_lock')&&read('app/api/schedule-publish/route.ts').includes('idempotencyKey')],
 ['security headers',read('next.config.ts').includes('Content-Security-Policy')],
 ['direct migration URL',read('scripts/migrate.mjs').includes('DATABASE_DIRECT_URL')],
];
for(const [name,ok] of checks){if(!ok)throw new Error(`Failed: ${name}`);console.log(`✓ ${name}`)}
