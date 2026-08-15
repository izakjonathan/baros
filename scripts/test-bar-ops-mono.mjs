import { isVersionAtLeast } from "./version-utils.mjs";
import fs from 'node:fs';
const css = fs.readFileSync('app/mono-tokens.css', 'utf8') + fs.readFileSync('app/mono-components.css', 'utf8');
const layout = fs.readFileSync('app/layout.tsx', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const checks = [
  ['version', isVersionAtLeast(pkg.version, "0.9.8")],
  ['mono imported', layout.includes('import "./mono-tokens.css"') && layout.includes('import "./mono-components.css"')],
  ['approved flat canvas', css.includes('--mono-canvas: #fff4c4')],
  ['approved beige surface', css.includes('--mono-surface: #fff4c4')],
  ['black icon system', css.includes('One icon system: black outline')],
  ['borderless surfaces', css.includes('border: 0')],
  ['tonal fields', css.includes('background: var(--mono-inset)')],
  ['focus visible', css.includes(':focus-visible')],
  ['44px touch target', css.includes('--mono-control: 44px')],
  ['reduced motion', css.includes('prefers-reduced-motion')],
];
for (const [name, ok] of checks) {
  if (!ok) throw new Error(`Bar Ops Mono check failed: ${name}`);
}
console.log(`Bar Ops Mono checks passed (${checks.length})`);
