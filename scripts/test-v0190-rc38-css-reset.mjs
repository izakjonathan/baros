import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const css=walk(root).filter(p=>p.endsWith('.css')&&!p.includes('/node_modules/')&&!p.includes('/.next/'));
const rel=css.map(p=>path.relative(root,p)).sort();
const pkg=JSON.parse(read('package.json'));
const layout=read('app/layout.tsx');
const employeeLayout=read('app/employee/layout.tsx');
const global=read('app/globals.css');
const schedule=read('features/scheduling/ScheduleWorkspace.module.css');
const app=read('components/bar-ops-app.tsx');
const checks=[
 ['version is rc.38',pkg.version==='0.19.0-rc.38'],
 ['only three CSS files exist',JSON.stringify(rel)===JSON.stringify(['app/globals.css','features/scheduling/ScheduleWorkspace.module.css','styles/tokens.css'])],
 ['root imports only global CSS',layout.includes('import "./globals.css";')&&!layout.includes('completion-redesign.css')&&!layout.includes('system-contracts.css')&&!layout.includes('design-system.css')],
 ['employee has no route CSS import',!employeeLayout.includes('.css')],
 ['only Shift Plan uses CSS module',app.includes('ScheduleWorkspace.module.css')],
 ['global CSS owns shell',global.includes('.sidebar{')&&global.includes('.topbar{')&&global.includes('.main-shell{')],
 ['global CSS owns controls',global.includes('.button,.primary,.secondary')&&global.includes('input,select,textarea')],
 ['global CSS owns cards and metrics',global.includes('.panel,.card{')&&global.includes('.metrics{')],
 ['global CSS owns employee portal',global.includes('.employee-page{')&&global.includes('.shift-action-row{')],
 ['shift CSS owns schedule grid',schedule.includes('.calendarGrid{')&&schedule.includes('.shiftCard{')&&schedule.includes('.dayColumn{')],
 ['no release patch comments in CSS',css.every(p=>!/(v0\.\d|rc\.\d)/i.test(fs.readFileSync(p,'utf8')))],
 ['no important outside reduced motion',global.split('!important').length-1<=4 && schedule.split('!important').length-1<=1],
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}if(failed)process.exit(1);
console.log(`CSS files: ${rel.length}`);
