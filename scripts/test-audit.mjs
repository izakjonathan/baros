import fs from 'node:fs';
const app=fs.readFileSync(new URL('../components/bar-ops-app.tsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
const checks=[
 ['approved-only export',app.includes('filter(e=>e.status==="Approved")')],
 ['timesheet correction',app.includes('Correct timesheet')&&app.includes('edited:true')],
 ['reopen approval',app.includes('reopenTimesheet')],
 ['reject workflow',app.includes('rejectTimesheet')],
 ['exception detection',app.includes('Variance, no break, or edited')],
 ['export history',app.includes('Export history')],
 ['responsive attendance filters',css.includes('grid-template-columns:repeat(4,minmax(150px,1fr))')],
 ['mobile single-column forms',css.includes('.form-grid{grid-template-columns:1fr}')],
 ['reduced motion support',css.includes('prefers-reduced-motion')],
 ['visible focus styles',css.includes(':focus-visible')],
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}if(failed)process.exit(1);
