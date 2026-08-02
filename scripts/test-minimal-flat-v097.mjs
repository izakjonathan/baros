import fs from 'node:fs';
const css=fs.readFileSync('app/globals.css','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[
 ['version',['0.9.7','0.9.8','0.9.9','0.10.0'].includes(pkg.version)],
 ['light grey canvas',css.includes('--canvas:#f3f4f6')],
 ['black icon stroke',css.includes('svg{stroke:var(--ink);fill:none}')],
 ['transparent icon buttons',css.includes('.icon-button,.menu-button,.help-button')&&css.includes('background:transparent!important')],
 ['flat cards',css.includes('Flat surface hierarchy')&&css.includes('border:0!important')],
 ['equal action height',css.includes('min-height:40px!important')&&css.includes('.modal-actions>button,.team-card-actions>button')],
 ['tonal inputs',css.includes('background:#f0f1f3!important')],
 ['subtle data rules',css.includes('rgba(17,18,20,.055)')],
];
for(const [name,ok] of checks){if(!ok) throw new Error(`v0.9.7 check failed: ${name}`)}
console.log(`v0.9.7 minimal flat checks passed (${checks.length})`);
