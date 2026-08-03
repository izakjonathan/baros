import fs from 'node:fs';
const app=fs.readFileSync(new URL('../components/bar-ops-app.tsx',import.meta.url),'utf8');
import { readStyles } from './read-styles.mjs';
const css=readStyles();
const data=fs.readFileSync(new URL('../lib/data.ts',import.meta.url),'utf8');
const checks=[
 ['product editing', app.includes('Edit product') && app.includes('Reorder level')],
 ['stock counts', app.includes('Approve stock count') && app.includes('StockCountDialog')],
 ['adjustment reasons', app.includes('Stock adjustment saved') && app.includes('Reason for')],
 ['daily operations', app.includes('Daily operations') && app.includes('Manager logbook')],
 ['local persistence', app.includes('barops-dev-v091') && app.includes('localStorage.setItem')],
 ['dev export reset', app.includes('Export JSON') && app.includes('Reset demo data')],
 ['product schema', data.includes('reorderLevel?: number') && data.includes('sellingPrice?: number')],
 ['responsive operations', css.includes('.operations-layout') && css.includes('.stock-count-list')],
];
for(const [name,pass] of checks){if(!pass)throw new Error(`FAIL ${name}`);console.log(`PASS ${name}`)}
