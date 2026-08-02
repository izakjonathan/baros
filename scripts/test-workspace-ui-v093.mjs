import fs from 'node:fs';
const app=fs.readFileSync('components/bar-ops-app.tsx','utf8');
const css=fs.readFileSync('app/globals.css','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[
  [['0.9.6','0.9.7','0.9.8','0.9.9','0.10.0'].includes(pkg.version),'package version is compatible'],
  [!app.includes('Manage how Temple Bar operates.'),'settings subtitle removed'],
  [!app.includes('Add employees, maintain records and manage employee portal access.'),'team subtitle removed'],
  [!app.includes('Maintain the employee profile used throughout scheduling.'),'employee modal subtitle removed'],
  [!app.includes('Resolve exceptions, approve accurate time, lock the payroll period, and export a traceable payroll file.'),'attendance workflow copy removed'],
  [app.includes('setSearchOpen(v=>!v)') && app.includes('setNotificationsOpen(v=>!v)'),'search and notifications have interactive state'],
  [app.includes('"week" | "month" | "custom"'),'week month custom schedule modes exist'],
  [app.includes('weekStart: startIso') && app.includes('weekEnd: exclusiveEnd'),'selected range publishing is persisted'],
  [app.includes('onNewShift(day.iso)'),'day add-shift passes exact date'],
  [app.includes('team-add-button'),'compact team add control exists'],
  [css.includes('.topbar{position:fixed'),'top navigation is fixed'],
  [css.includes('.metric-grid,.attendance-metrics{grid-template-columns:repeat(2'),'overview and attendance use 2x2 metrics'],
  [css.includes('.day-column.today .day-header'),'today highlights whole header'],
  [css.includes('.team-actions.three-actions'),'team action row adapts to three buttons'],
];
for(const [ok,label] of checks){if(!ok){console.error('FAIL:',label);process.exit(1)}console.log('PASS:',label)}
