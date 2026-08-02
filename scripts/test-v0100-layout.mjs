import fs from 'node:fs';
const css=fs.readFileSync(new URL('../app/design-system.css',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const checks=[
 ['version',['0.10.0','0.10.1','0.10.2','0.10.3','0.10.4','0.10.5','0.10.6','0.11.0'].includes(pkg.version)],
 ['fixed topbar',/\.topbar\s*\{[^}]*position:\s*fixed/.test(css)],
 ['mobile sidebar below header',/\.sidebar\s*\{[^}]*top:\s*var\(--app-header-height\)/.test(css)],
 ['labelled publish width',/compact-publish[^\{]*\{[^}]*min-width:\s*116px/.test(css)],
 ['stable view selector',/schedule-view-select[^\{]*\{[^}]*min-(?:inline-)?size:\s*1(?:18|26)px/.test(css)],
 ['compact team cards',/\.team-card\s*\{[^}]*padding:\s*1[4-6]px/.test(css)],
];
const failed=checks.filter(([,ok])=>!ok);
if(failed.length){console.error(failed.map(([n])=>`FAIL ${n}`).join('\n'));process.exit(1)}
console.log('v0.10.0 layout checks passed');
