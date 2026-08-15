import fs from 'node:fs';
const app=fs.readFileSync('components/bar-ops-app.tsx','utf8');
const ops=fs.readFileSync('features/operations/DailyOperations.module.css','utf8');
const settings=fs.readFileSync('features/settings/SettingsWorkspace.module.css','utf8');
const checks=[
 ['operations CSS module imported',app.includes('DailyOperations.module.css')],
 ['settings CSS module imported',app.includes('SettingsWorkspace.module.css')],
 ['daily operations workspace locally scoped',app.includes('operationsStyles.workspace')],
 ['settings workspace locally scoped',app.includes('settingsStyles.workspace')],
 ['native date input has intrinsic-width containment',ops.includes('min-inline-size:0')&&ops.includes('max-inline-size:100%')&&ops.includes('box-sizing:border-box')],
 ['operations mobile layout is single column',ops.includes('@media(max-width:720px)')&&ops.includes('.layout{grid-template-columns:1fr}')],
 ['settings inputs are width contained',settings.includes('.fields input,.fields select')&&settings.includes('min-inline-size:0')],
 ['settings mobile fields are single column',settings.includes('.fields{grid-template-columns:1fr}')],
 ['business API routes preserved',app.includes('/api/operation-checklists')&&app.includes('/api/settings/time-clock')]
];
const failed=checks.filter(([,ok])=>!ok);
for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} ${name}`);
if(failed.length) process.exit(1);
