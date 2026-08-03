import fs from 'node:fs';
const read = p => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const app = read('components/bar-ops-app.tsx') + read('components/app-shell.tsx');
const hours = read('app/employee/hours/page.tsx');
const api = read('app/api/time-clock/route.ts');
const settings = read('app/api/settings/time-clock/route.ts');
const summary = read('app/api/employee/hours-summary/route.ts');
const corrections = read('app/api/employee/timesheet-corrections/route.ts');
const data = read('lib/data.ts');
const checks = [
  ['settings nav key', data.includes('| "settings"')],
  ['settings button wired', app.includes('id: "settings" as NavKey')],
  ['settings workspace rendered', app.includes('<SettingsWorkspace')],
  ['time clock settings api', settings.includes('time_clock_settings') && settings.includes('on conflict(location_id)')],
  ['persistent clock load', hours.includes('fetch("/api/time-clock"')],
  ['persistent clock actions', hours.includes('body: JSON.stringify({ action, ...location })')],
  ['active clock restore', api.includes('breakActive') && api.includes("status='OPEN'")],
  ['published shift linking', api.includes("status='PUBLISHED'") && api.includes('nextShift?.id')],
  ['hours summary', summary.includes('scheduled_minutes') && summary.includes('approved_minutes')],
  ['correction persistence', corrections.includes('timesheet_correction_requests')],
  ['settings ui styles', read('app/styles/legacy-geometry.css').includes('.settings-layout') || read('app/styles/components.css').includes('.settings-layout')],
];
const failed = checks.filter(([,ok])=>!ok);
for (const [name,ok] of checks) console.log(`${ok?'✓':'✗'} ${name}`);
if (failed.length) process.exit(1);
console.log('v0.8.9 settings and time-clock checks passed');
