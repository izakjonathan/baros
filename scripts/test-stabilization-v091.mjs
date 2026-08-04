import fs from 'node:fs';
const app=fs.readFileSync('components/bar-ops-app.tsx','utf8');
const bootstrap=fs.readFileSync('app/api/manager/bootstrap/route.ts','utf8');
const shifts=fs.readFileSync('app/api/shifts/route.ts','utf8');
const scheduleMapper=fs.readFileSync('features/workspace/schedule-utils.ts','utf8');
const clock=fs.readFileSync('app/api/time-clock/route.ts','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[
 ['dynamic calendar baseline',!app.includes('new Date(2026, 6, 27')],
 ['dynamic month anchor',!app.includes('new Date(2026, 7 + monthOffset')],
 ['versioned local storage',app.includes('barops-dev-v091')],
 ['copy week persists',app.includes('async function copyPreviousWeek')&&app.includes('Could not copy previous week')],
 ['timezone joins',bootstrap.includes('location_timezone')&&shifts.includes('location_timezone')],
 ['timezone display',scheduleMapper.includes('Intl.DateTimeFormat')&&scheduleMapper.includes('location_timezone')],
 ['production stock count persists',app.includes('Could not save stock count')],
 ['package version',/^0\.9\.[1-9]$/.test(pkg.version)||/^0\.[1-9]\d+\./.test(pkg.version)],
 ['database timeout',fs.readFileSync('lib/db/client.ts','utf8').includes('connect_timeout')],
 ['atomic time clock',clock.includes('const result = await db().begin')&&clock.includes('for update')],
 ['venue-local work date',clock.includes('at time zone')],
 ['no stale build info',!fs.existsSync('tsconfig.tsbuildinfo')],
];
let fail=false; for(const [name,ok] of checks){console.log(`${ok?'✓':'✗'} ${name}`); if(!ok) fail=true;} if(fail) process.exit(1);
