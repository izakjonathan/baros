import fs from 'node:fs';
const app=fs.readFileSync(new URL('../components/bar-ops-app.tsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../app/globals.css',import.meta.url),'utf8')+fs.readFileSync(new URL('../app/design-system.css',import.meta.url),'utf8');
const checks=[
 ['approved-only export',app.includes('filter(e=>e.status==="Approved")')],
 ['timesheet correction',app.includes('Correct timesheet')&&app.includes('edited:true')],
 ['reopen approval',app.includes('reopenTimesheet')],
 ['reject workflow',app.includes('rejectTimesheet')],
 ['exception detection',app.includes('Variance, no break, or edited')],
 ['export history',app.includes('Export history')],
 ['responsive attendance filters',/grid-template-columns\s*:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/.test(css)],
 ['mobile single-column forms',/\.form-grid\s*\{[^}]*grid-template-columns\s*:\s*1fr/.test(css)],
 ['reduced motion support',css.includes('prefers-reduced-motion')],
 ['visible focus styles',css.includes(':focus-visible')],
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}if(failed)process.exit(1);
