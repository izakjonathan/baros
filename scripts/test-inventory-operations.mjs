import fs from 'node:fs';
const app=fs.readFileSync(new URL('../components/bar-ops-app.tsx',import.meta.url),'utf8');
const inventory=fs.readFileSync(new URL('../features/inventory/InventoryWorkspace.tsx',import.meta.url),'utf8');
const operations=fs.readFileSync(new URL('../features/operations/DailyOperationsWorkspace.tsx',import.meta.url),'utf8');
const control=fs.readFileSync(new URL('../features/control/ControlCenterWorkspace.tsx',import.meta.url),'utf8');
const uiSource=`${app}\n${inventory}\n${operations}\n${control}`;
const css=fs.readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
const data=fs.readFileSync(new URL('../lib/data.ts',import.meta.url),'utf8');
const checks=[
 ['product editing', uiSource.includes('Edit product') && uiSource.includes('Reorder level')],
 ['stock counts', uiSource.includes('Approve stock count') && uiSource.includes('StockCountDialog')],
 ['adjustment reasons', uiSource.includes('Stock adjustment saved') && uiSource.includes('Reason for')],
 ['daily operations', uiSource.includes('Daily operations') && uiSource.includes('Manager logbook')],
 ['local persistence', app.includes('barops-dev-v091') && app.includes('localStorage.setItem')],
 ['dev export reset', uiSource.includes('Export JSON') && uiSource.includes('Reset demo data')],
 ['product schema', data.includes('reorderLevel?: number') && data.includes('sellingPrice?: number')],
 ['responsive operations', css.includes('.ops-layout{display:grid') && css.includes('@media(max-width:64rem)') && css.includes('.stock-count-list')],
];
for(const [name,pass] of checks){if(!pass)throw new Error(`FAIL ${name}`);console.log(`PASS ${name}`)}
