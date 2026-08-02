import fs from 'node:fs';
const tokens=fs.readFileSync('app/design-tokens.css','utf8');
const css=fs.readFileSync('app/design-system.css','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[
 ['version',['0.9.7','0.9.8','0.9.9','0.10.0','0.10.1','0.10.2','0.10.3','0.10.4','0.10.5','0.10.6','0.11.0','0.11.1','0.11.2','0.11.3','0.11.4','0.11.6','0.11.8','0.11.9','0.12.0','0.12.1','0.12.2'].includes(pkg.version)],
 ['light grey canvas',tokens.includes('--color-canvas: #f4f4f2')],
 ['black icon stroke',css.includes(':where(.lucide')&&css.includes('stroke: currentColor')],
 ['transparent icon buttons',/\.icon-button[\s\S]*background\s*:\s*transparent/.test(css) && /\.floating-navigation-toggle[\s\S]*background\s*:\s*var\(--color-text\)/.test(css)],
 ['flat cards',css.includes('Shared surfaces and density')&&css.includes('border: 0')],
 ['equal action height',tokens.includes('--control-height-compact: 40px')&&css.includes('.dialog-footer-actions > *')],
 ['tonal inputs',css.includes('background: var(--color-surface-muted)')],
 ['subtle data rules',css.includes('rgba(17,17,17,.055)')],
];
for(const [name,ok] of checks){if(!ok) throw new Error(`v0.9.7 check failed: ${name}`)}
console.log(`v0.9.7 minimal flat checks passed (${checks.length})`);
