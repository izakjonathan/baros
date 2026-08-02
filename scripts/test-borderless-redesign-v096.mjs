import fs from 'node:fs';
const css=fs.readFileSync(new URL('../app/design-system.css',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const checks=[
 [['0.9.6','0.9.7','0.9.8','0.9.9','0.10.0','0.10.1','0.10.2','0.10.3','0.10.4','0.10.5','0.10.6'].includes(pkg.version),'package version'],
 [css.includes('Tonal surface hierarchy'),'redesign layer exists'],
 [/\.topbar[^\{]*\{[^}]*border\s*:\s*0/.test(css),'topbar divider removed'],
 [/\.icon-button[^\{]*\{[^}]*border\s*:\s*0[^}]*background\s*:\s*transparent/.test(css),'top navigation actions are icon-only'],
 [css.includes('.metric-card, .panel, .team-card, .settings-panel'),'card surface system exists'],
 [/\.employee-header[^\{]*\{[^}]*border\s*:\s*0/.test(css),'employee header divider removed'],
 [/\.employee-nav[^\{]*\{[^}]*border\s*:\s*0/.test(css),'employee bottom-nav divider removed'],
 [css.includes('.secondary:hover'),'same-surface control affordances retained'],
];
for(const [ok,label] of checks){if(!ok){console.error(`FAIL ${label}`);process.exit(1)}console.log(`PASS ${label}`)}
