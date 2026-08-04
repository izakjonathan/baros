import fs from 'node:fs';
const css=fs.readFileSync(new URL('../app/mono-components.css',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const checks=[
 ['version',['0.10.0','0.10.1','0.10.2','0.10.3','0.10.4','0.10.5','0.10.6','0.10.7','0.10.8','0.10.9','0.10.10','0.10.11','0.11.0','0.11.1','0.11.2','0.11.3','0.11.4','0.11.6','0.12.0','0.12.1','0.12.2','0.12.3','0.12.4','0.13.0','0.13.1','0.13.2','0.13.3'].includes(pkg.version)],
 ['fixed topbar',/\.topbar\s*\{[^}]*position\s*:\s*fixed/s.test(css)],
 ['mobile sidebar below header',/\.sidebar\s*\{[^}]*top\s*:\s*var\(--app-header-height\)/s.test(css)],
 ['labelled publish width',/\.compact-publish[\s\S]*?min-width\s*:\s*116px/.test(css)],
 ['stable view selector',/\.schedule-view-select\s*\{[^}]*min-width\s*:\s*132px/s.test(css)],
 ['compact team cards',/\.team-card\s*\{[^}]*gap\s*:\s*10px/s.test(css)],
];
const failed=checks.filter(([,ok])=>!ok);
if(failed.length){console.error(failed.map(([n])=>`FAIL ${n}`).join('\n'));process.exit(1)}
console.log('v0.10.0 layout checks passed');
