import fs from 'node:fs';
const app=fs.readFileSync('components/bar-ops-app.tsx','utf8');
const css=['app/globals.css','app/mono-tokens.css','app/mono-components.css'].map((file)=>fs.readFileSync(file,'utf8')).join('\n');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[
  [['0.9.6','0.9.7','0.9.8','0.9.9','0.10.0','0.10.1','0.10.2','0.10.3','0.10.4','0.10.5','0.10.6','0.10.7','0.10.8','0.10.9','0.10.10','0.10.11','0.11.0','0.11.1','0.11.2','0.11.3'].includes(pkg.version),'package version is compatible'],
  [!app.includes('Manage how Temple Bar operates.'),'settings subtitle removed'],
  [!app.includes('Add employees, maintain records and manage employee portal access.'),'team subtitle removed'],
  [!app.includes('Maintain the employee profile used throughout scheduling.'),'employee modal subtitle removed'],
  [!app.includes('Resolve exceptions, approve accurate time, lock the payroll period, and export a traceable payroll file.'),'attendance workflow copy removed'],
  [app.includes('setSearchOpen(v=>!v)') && app.includes('setNotificationsOpen(v=>!v)'),'search and notifications have interactive state'],
  [app.includes('"week" | "month" | "custom"'),'week month custom schedule modes exist'],
  [app.includes('weekStart: startIso') && app.includes('weekEnd: exclusiveEnd'),'selected range publishing is persisted'],
  [app.includes('onNewShift(day.iso)'),'day add-shift passes exact date'],
  [app.includes('team-add-button'),'compact team add control exists'],
  [/\.topbar\s*\{[^}]*position\s*:\s*fixed/s.test(css),'top navigation is fixed'],
  [/\.metric-grid\s*,\s*\.attendance-metrics\s*\{[^}]*grid-template-columns\s*:\s*repeat\(2/s.test(css),'overview and attendance use 2x2 metrics'],
  [/\.day-column\.today\s+\.day-header/.test(css),'today highlights whole header'],
  [css.includes('.team-actions.three-actions'),'team action row adapts to three buttons'],
];
for(const [ok,label] of checks){if(!ok){console.error('FAIL:',label);process.exit(1)}console.log('PASS:',label)}
