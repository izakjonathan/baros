import fs from 'node:fs';
const css = fs.readFileSync('app/design-tokens.css', 'utf8') + fs.readFileSync('app/product-system.css', 'utf8');
const layout = fs.readFileSync('app/layout.tsx', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const checks = [
  ['version', ['0.9.8','0.9.9','0.10.0','0.10.1','0.10.2','0.10.3','0.10.4','0.10.5','0.10.6','0.11.0','0.11.1','0.11.2','0.11.3','0.11.4','0.11.6','0.11.8','0.11.9','0.12.0','0.12.1','0.13.0','0.13.1'].includes(pkg.version)],
  ['mono imported', layout.includes('import "./design-tokens.css"') && layout.includes('import "./product-system.css"')],
  ['light grey canvas', css.includes('--color-canvas: #f4f4f2')],
  ['white surface', css.includes('--color-surface: #ffffff')],
  ['black icon system', css.includes('One icon system: black outline')],
  ['borderless surfaces', css.includes('border: 0')],
  ['tonal fields', css.includes('background: var(--color-surface-muted)')],
  ['focus visible', css.includes(':focus-visible')],
  ['44px touch target', css.includes('--control-height: 44px')],
  ['reduced motion', css.includes('prefers-reduced-motion')],
];
for (const [name, ok] of checks) {
  if (!ok) throw new Error(`Bar Ops Mono check failed: ${name}`);
}
console.log(`Bar Ops Mono checks passed (${checks.length})`);
