import fs from 'node:fs';
const ui=fs.readFileSync('components/bar-ops-app.tsx','utf8')+fs.readFileSync('components/app-shell.tsx','utf8')+fs.readFileSync('features/team/team.tsx','utf8');
const css=fs.readFileSync('app/globals.css','utf8');
const checks=[
 ['overview add-shift removed',!ui.includes('Good evening, Izak')&&!ui.includes('onNewShift={() => openShiftDialog()}')],
 ['fixed top navigation',css.includes('.topbar{position:fixed')],
 ['overview 2x2 metrics',css.includes('.metric-grid,.attendance-metrics{grid-template-columns:repeat(2')],
 ['square navigation buttons',css.includes('aspect-ratio:1')],
 ['search interaction',ui.includes('searchOpen')&&ui.includes('Search workspace')],
 ['notification interaction',ui.includes('notificationsOpen')&&ui.includes('Notifications')],
 ['settings subtitle removed',!ui.includes('Manage how ${location?.name')],
 ['schedule custom range',ui.includes('"custom"')&&ui.includes('customFrom')&&ui.includes('customTo')],
 ['publish arbitrary range',ui.includes('weekStart: startIso')&&ui.includes('weekEnd: exclusiveEnd')],
 ['today full header highlight',css.includes('.day-column.today .day-header')],
 ['attendance workflow removed',!ui.includes('Resolve exceptions, approve accurate time')&&!ui.includes('className="attendance-workflow"')],
 ['team compact identity',ui.includes('team-identity')&&ui.includes('team-status')],
 ['employee modal subtitle removed',!ui.includes('Maintain the employee profile used throughout scheduling.')]
];
for(const [name,ok] of checks){if(!ok)throw new Error(`FAIL ${name}`);console.log(`PASS ${name}`)}
