import fs from 'node:fs';
const css=fs.readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const checks=[
 [['0.9.6','0.9.7'].includes(pkg.version),'package version'],
 [css.includes('/* v0.9.6 borderless surface redesign */'),'redesign layer exists'],
 [/\.topbar\{[^}]*border-bottom:0!important/.test(css),'topbar divider removed'],
 [/\.icon-button,\.menu-button\{[^}]*border:0!important[^}]*background:transparent!important[^}]*color:#11130f!important/.test(css),'top navigation actions are icon-only'],
 [css.includes('.metric-card,.panel,.team-card,.settings-panel'),'card surface override exists'],
 [css.includes('.employee-header{border-bottom:0!important'),'employee header divider removed'],
 [css.includes('.employee-nav{border-top:0!important'),'employee bottom-nav divider removed'],
 [css.includes('.panel .secondary,.team-card .secondary'),'same-surface control affordances retained'],
];
for(const [ok,label] of checks){if(!ok){console.error(`FAIL ${label}`);process.exit(1)}console.log(`PASS ${label}`)}
