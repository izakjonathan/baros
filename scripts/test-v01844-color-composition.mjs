import fs from 'node:fs';
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const team=fs.readFileSync('features/employees/TeamWorkspace.module.css','utf8');
const dashboard=fs.readFileSync('features/dashboard/Dashboard.module.css','utf8');
const schedule=fs.readFileSync('features/scheduling/ScheduleWorkspace.module.css','utf8');
const globals=fs.readFileSync('app/globals.css','utf8');
const fail=(m)=>{console.error(`v0.18.4.5 regression: ${m}`);process.exit(1)};
if(pkg.version!=='0.18.4.5') fail('package version mismatch');
for (const [name, css] of [['team',team],['dashboard',dashboard],['schedule',schedule]]) {
  for (const color of ['#dfee4b','#f47add','#9561e6','#fd2200']) if(!css.includes(color)) fail(`${name} is missing ${color}`);
}
if(!globals.includes('editorial page composition')) fail('editorial page composition layer missing');
if(!globals.includes('data-workspace="team"')||!globals.includes('data-workspace="execution"')) fail('workspace title sections missing');
if(dashboard.includes('background:#fff4c4;border:2px solid #000')) fail('legacy beige outlined dashboard panels returned');
if(!schedule.includes('background:#f47add')||!schedule.includes('background:#fd2200')) fail('schedule color architecture missing');
console.log('v0.18.4.5 color architecture regression passed');
