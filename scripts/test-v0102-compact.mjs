import fs from 'node:fs';
const app=fs.readFileSync('components/bar-ops-app.tsx','utf8')+fs.readFileSync('lib/workspace-types.ts','utf8');
const css=fs.readFileSync('app/product-system.css','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[
 ['version',/^0\.10\.(?:2|3|4|5|6)$/.test(pkg.version) || ['0.11.0','0.11.1','0.11.2','0.11.3','0.11.4','0.11.6','0.11.8','0.11.9','0.12.0','0.12.1','0.13.0','0.13.1'].includes(pkg.version)],
 ['hourly rate type',app.includes('hourlyRate?: number')],
 ['hourly rate field',app.includes('Hourly pay (DKK)')],
 ['no employee autofocus',!app.includes('<input autoFocus value={name}')],
 ['bootstrap ref',app.includes('hasBootstrappedRef')],
 ['shift compact fields',app.includes('shift-dialog-fields')],
 ['selector width',/schedule-view-select[\s\S]*?(?:width|inline-size):\s*(?:126|132)px/.test(css)],
 ['attendance two-column mobile',/\.attendance-filters\s*\{[^}]*grid-template-columns\s*:\s*repeat\(2/.test(css)],
 ['repeat transparent',/\.repeat-switch[\s\S]*\.repeat-panel/.test(css)]
];
for(const [name,ok] of checks){if(!ok) throw new Error(`v0.10.2 check failed: ${name}`)}
console.log('v0.10.2 compact layout checks passed');
