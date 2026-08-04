import fs from 'node:fs';
const app=fs.readFileSync('components/bar-ops-app.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[
  ['version',['0.13.0','0.13.1'].includes(pkg.version)],
  ['default navigation label',app.includes('label: "Today’s operations"')],
  ['live dashboard title',app.includes('title="Today’s operations"')],
  ['30 second refresh',app.includes('window.setInterval(refresh, 30000)')],
  ['visibility refresh',app.includes('visibilitychange')],
  ['live request loading',app.includes('fetch("/api/requests"')],
  ['staffing metrics',app.includes('label="Clocked in"')&&app.includes('label="Expected next"')],
  ['schedule attention',app.includes('schedule issues')],
  ['inventory attention',app.includes('products below par')],
  ['operations tasks',app.includes('operations tasks open')],
  ['quick actions',app.includes('label="Receive delivery"')&&app.includes('label="Daily operations"')],
];
for(const [name,ok] of checks){if(!ok) throw new Error(`v0.13.0 check failed: ${name}`)}
console.log(`v0.13.0 daily operations checks passed (${checks.length})`);
