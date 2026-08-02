import fs from 'node:fs';
const app=fs.readFileSync('components/bar-ops-app.tsx','utf8');
const css=fs.readFileSync('app/design-system.css','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[
 ['version',/^0\.10\.(?:2|3|4|5|6)$/.test(pkg.version)],
 ['hourly rate type',app.includes('hourlyRate?: number')],
 ['hourly rate field',app.includes('Hourly pay (DKK)')],
 ['no employee autofocus',!app.includes('<input autoFocus value={name}')],
 ['bootstrap ref',app.includes('hasBootstrappedRef')],
 ['shift compact fields',app.includes('shift-dialog-fields')],
 ['selector width',/schedule-view-select[\s\S]*?(?:width|inline-size):\s*(?:126|132)px/.test(css)],
 ['attendance two-column mobile',css.includes('.attendance-filters { grid-template-columns: repeat(2')],
 ['repeat transparent',css.includes('.repeat-switch,\n.repeat-panel')]
];
for(const [name,ok] of checks){if(!ok) throw new Error(`v0.10.2 check failed: ${name}`)}
console.log('v0.10.2 compact layout checks passed');
