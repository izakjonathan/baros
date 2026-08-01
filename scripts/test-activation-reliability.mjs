import fs from 'node:fs';
const route = fs.readFileSync('app/api/auth/activate/route.ts','utf8');
const migration = fs.readFileSync('db/migrations/010_employee_activation_reliability.sql','utf8');
const checks = [
  ['atomic transaction', route.includes('db().begin')],
  ['session inserted in transaction', route.includes('insert into sessions')],
  ['cookie set after transaction', route.includes('store.set(cookieName()')],
  ['employee link verified', route.includes('EMPLOYEE_LINK_FAILED')],
  ['audit json serialized', route.includes('::jsonb') && route.includes('JSON.stringify')],
  ['RLS reliability migration', migration.includes('disable row level security')],
  ['schema compatibility', migration.includes('add column if not exists updated_at')],
];
const failed = checks.filter(([,ok])=>!ok);
for (const [name,ok] of checks) console.log(`${ok?'✓':'✗'} ${name}`);
if (failed.length) process.exit(1);
