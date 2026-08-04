import fs from 'node:fs';
const app=fs.readFileSync('components/bar-ops-app.tsx','utf8');
const timesheets=fs.readFileSync('app/api/timesheets/route.ts','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[
 ['version',['0.10.1','0.10.2','0.10.3','0.10.4','0.10.5','0.10.6','0.10.7','0.10.8','0.10.9','0.10.10','0.10.11','0.11.0','0.11.1','0.11.2','0.11.3','0.11.4','0.11.6','0.12.0','0.12.1','0.12.2','0.12.3','0.12.4','0.13.0','0.13.1','0.13.2'].includes(pkg.version)],
 ['drag drop persists',app.includes('Could not move shift')&&app.includes('scope:"occurrence"')],
 ['stock adjustments persist',app.includes('Could not save stock adjustment')&&app.includes('quantity:nextStock')],
 ['order search works',app.includes('visibleOrders')&&app.includes('statusFilter')],
 ['order empty state',app.includes('No orders match the current filters.')],
 ['timesheet corrections persist',app.includes('clockIn:updated.clockIn')&&timesheets.includes('TIMESHEET_CORRECTED')],
 ['sidebar close labelled',app.includes('aria-label="Close navigation"')],
 ['new storage namespace',app.includes('barops-dev-v0101')],
];
for(const [name,ok] of checks){if(!ok)throw new Error(`FAIL ${name}`);console.log(`PASS ${name}`)}
