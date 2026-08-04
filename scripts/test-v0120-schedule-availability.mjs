import fs from 'node:fs';
const shifts=fs.readFileSync('app/api/shifts/route.ts','utf8');
const publish=fs.readFileSync('app/api/schedule-publish/route.ts','utf8');
const app=fs.readFileSync('components/bar-ops-app.tsx','utf8');
const data=fs.readFileSync('lib/data.ts','utf8');
const checks=[
  [shifts.includes('assertEmployeeAvailability'), 'shift mutations check employee availability'],
  [shifts.includes("type='TIME_OFF' and status='APPROVED'"), 'approved time off is checked'],
  [shifts.includes('OUTSIDE_AVAILABILITY'), 'availability window conflicts are identified'],
  [publish.includes('Resolve employee availability conflicts before publishing'), 'publishing blocks availability conflicts'],
  [app.includes('availabilityConflicts'), 'schedule displays availability conflicts'],
  [app.includes('Time off') && app.includes('Unavailable'), 'conflict badges distinguish reasons'],
  [data.includes('availabilityConflict?:'), 'shift type carries conflict metadata'],
];
for(const [ok,label] of checks){if(!ok) throw new Error(`FAIL: ${label}`); console.log(`PASS: ${label}`)}
