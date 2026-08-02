import fs from 'node:fs';
const css=fs.readFileSync(new URL('../app/product-system.css',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const checks=[
 [['0.9.6','0.9.7','0.9.8','0.9.9','0.10.0','0.10.1','0.10.2','0.10.3','0.10.4','0.10.5','0.10.6','0.11.0','0.11.1','0.11.2','0.11.3','0.11.4','0.11.6','0.11.8','0.11.9','0.12.0','0.12.1','0.13.0','0.13.1'].includes(pkg.version),'package version'],
 [css.includes('Tonal surface hierarchy'),'redesign layer exists'],
 [/\.topbar[^\{]*\{[^}]*border\s*:\s*0/.test(css),'topbar divider removed'],
 [/\.icon-button[^\{]*\{[^}]*border\s*:\s*0[^}]*background\s*:\s*transparent/.test(css),'top navigation actions are icon-only'],
 [/\.metric-card[\s\S]*background\s*:\s*var\(--color-surface\)/.test(css) && /\.team-card[\s\S]*background\s*:\s*var\(--color-surface\)/.test(css),'card surface system exists'],
 [/\.employee-header[^\{]*\{[^}]*border\s*:\s*0/.test(css),'employee header divider removed'],
 [/\.employee-nav[^\{]*\{[^}]*border\s*:\s*0/.test(css),'employee bottom-nav divider removed'],
 [css.includes('.secondary:hover'),'same-surface control affordances retained'],
];
for(const [ok,label] of checks){if(!ok){console.error(`FAIL ${label}`);process.exit(1)}console.log(`PASS ${label}`)}
