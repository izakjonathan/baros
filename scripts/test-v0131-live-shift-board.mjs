import fs from 'node:fs';
const app=fs.readFileSync('components/bar-ops-app.tsx','utf8');
const api=fs.readFileSync('app/api/manager/bootstrap/route.ts','utf8');
const css=fs.readFileSync('app/globals.css','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[
 ['version',['0.13.1','0.13.2','0.13.3','0.13.4','0.14.0','0.14.1','0.14.2'].includes(pkg.version),'0.13.2'],
 ['live board heading',app.includes('title="Live shift board"')],
 ['clocked in status',app.includes('status: "Clocked in"')],
 ['break status',app.includes('status: "On break"')],
 ['late status',app.includes('status: "Late"')],
 ['missing clock out',app.includes('status: "Missing clock-out"')],
 ['expected status',app.includes('status: "Expected"')],
 ['attendance deep link',app.includes('Open attendance')],
 ['open break query',api.includes('exists(select 1 from time_breaks')&&api.includes('on_break')],
 ['client break mapping',app.includes('onBreak:Boolean(x.on_break)')],
 ['live board styles',css.includes('/* v0.13.1 Live shift board */')&&css.includes('.live-board-row')]
];
for(const [name,ok] of checks) if(!ok) throw new Error(`v0.13.1 check failed: ${name}`);
console.log(`v0.13.1 live shift board checks passed (${checks.length})`);
