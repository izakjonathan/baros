import fs from 'node:fs';
const css=fs.readFileSync(new URL('../app/product-system.css',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const checks=[
 ['version',['0.10.0','0.10.1','0.10.2','0.10.3','0.10.4','0.10.5','0.10.6','0.11.0','0.11.1','0.11.2','0.11.3','0.11.4','0.11.6','0.11.8','0.11.9','0.12.0','0.12.1','0.13.0','0.13.1','0.13.2'].includes(pkg.version)],
 ['fixed topbar',/\.topbar\s*\{[^}]*position:\s*fixed/.test(css)],
 ['mobile sidebar below header',css.includes('.floating-navigation')],
 ['labelled publish width',css.includes('.publish-button') && css.includes('min-height: 46px')],
 ['stable view selector',css.includes('.schedule-view-select') && css.includes('min-width: 104px')],
 ['compact team cards',css.includes('.team-card { padding: var(--space-4)')],
];
const failed=checks.filter(([,ok])=>!ok);
if(failed.length){console.error(failed.map(([n])=>`FAIL ${n}`).join('\n'));process.exit(1)}
console.log('v0.10.0 layout checks passed');
