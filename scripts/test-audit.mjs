import fs from 'node:fs';
const app=fs.readFileSync(new URL('../components/bar-ops-app.tsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
const modalCss=fs.readFileSync(new URL('../app/completion-redesign.css',import.meta.url),'utf8');
const attendanceCss=fs.readFileSync(new URL('../features/attendance/AttendanceWorkspace.module.css',import.meta.url),'utf8');
const checks=[
 ['approved-only export',app.includes('filter(e=>e.status==="Approved")')],
 ['timesheet correction',app.includes('Correct timesheet')&&app.includes('edited:true')],
 ['reopen approval',app.includes('reopenTimesheet')],
 ['reject workflow',app.includes('rejectTimesheet')],
 ['exception detection',app.includes('Variance, no break, or edited')],
 ['export history',app.includes('Export history')],
 ['responsive attendance filters',attendanceCss.includes('.periodFields,.filterFields{display:grid')&&attendanceCss.includes('grid-template-columns:repeat(2,minmax(0,1fr))')],
 ['mobile single-column forms',modalCss.includes('.modal .form-grid{grid-template-columns:1fr}')],
 ['reduced motion support',css.includes('prefers-reduced-motion')],
 ['visible focus styles',css.includes(':focus-visible')],
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}if(failed)process.exit(1);
