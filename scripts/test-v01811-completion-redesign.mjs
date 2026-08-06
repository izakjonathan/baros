import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const css = read('app/completion-redesign.css');
const layout = read('app/layout.tsx');
const pkg = JSON.parse(read('package.json'));
const inventory = read('docs/redesign-inventory.md');

const required = [
  '.employee-app', '.employee-page', '.employee-nav', '.employee-more-sheet',
  '.login-page', '.login-card', '.modal-layer', '.modal-actions', '.top-popover',
  'repeat(2,minmax(0,1fr))', '::-webkit-date-and-time-value',
  '@media(max-width:480px)', '.empty-portal', '.workspace-loading'
];
for (const token of required) {
  if (!css.includes(token)) throw new Error(`Missing completion redesign contract: ${token}`);
}
if (!layout.includes('import "./completion-redesign.css";')) throw new Error('Completion stylesheet must be imported last in app/layout.tsx');
if (pkg.version !== '0.18.11') throw new Error(`Expected package version 0.18.11, got ${pkg.version}`);
if (!inventory.includes('Status: complete in v0.18.11')) throw new Error('Redesign inventory must record completion');
if (/overflow\s*:\s*hidden[^}]*request-date-grid/.test(css)) throw new Error('Date containment must not be implemented by clipping');
console.log('v0.18.11 completion redesign regression passed');
