import { isVersionAtLeast } from "./version-utils.mjs";
import fs from 'node:fs';
const app=fs.readFileSync('components/bar-ops-app.tsx','utf8');
const css=fs.readFileSync('app/mono-components.css','utf8');
const workspaceTypes=fs.readFileSync('features/workspace/types.ts','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[
 ['version',isVersionAtLeast(pkg.version, "0.10.2")],
 ['hourly rate type',workspaceTypes.includes('hourlyRate?: number')],
 ['hourly rate field',app.includes('Hourly pay (DKK)')],
 ['no employee autofocus',!app.includes('<input autoFocus value={name}')],
 ['bootstrap ref',app.includes('hasBootstrappedRef')],
 ['shift compact fields',app.includes('shift-dialog-fields')],
 ['selector width',css.includes('width: 132px')],
 ['attendance two-column mobile',css.includes('.attendance-filters { grid-template-columns: repeat(2')],
 ['repeat transparent',css.includes('.repeat-switch,\n.repeat-panel')]
];
for(const [name,ok] of checks){if(!ok) throw new Error(`v0.10.2 check failed: ${name}`)}
console.log('v0.10.2 compact layout checks passed');
