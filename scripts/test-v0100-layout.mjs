import fs from 'node:fs';
const css=fs.readFileSync(new URL('../app/mono-components.css',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const checks=[
 ['version',['0.10.0','0.10.1'].includes(pkg.version)],
 ['fixed topbar',/\.topbar\s*\{[\s\S]*?position:\s*fixed/.test(css.slice(css.lastIndexOf('v0.10.0')))],
 ['mobile sidebar below header',/\.sidebar\s*\{[\s\S]*?top:\s*var\(--app-header-height\)/.test(css.slice(css.lastIndexOf('v0.10.0')))],
 ['labelled publish width',/compact-publish[\s\S]*?min-width:\s*116px/.test(css.slice(css.lastIndexOf('v0.10.0')))],
 ['stable view selector',/schedule-view-select[\s\S]*?min-width:\s*118px/.test(css.slice(css.lastIndexOf('v0.10.0')))],
 ['compact team cards',/\.team-card\s*\{[\s\S]*?gap:\s*10px/.test(css.slice(css.lastIndexOf('v0.10.0')))],
];
const failed=checks.filter(([,ok])=>!ok);
if(failed.length){console.error(failed.map(([n])=>`FAIL ${n}`).join('\n'));process.exit(1)}
console.log('v0.10.0 layout checks passed');
