import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const app = read('components/bar-ops-app.tsx');
const dialog = read('components/ui/interaction-ui.tsx');
const employeeShell = read('app/employee/employee-shell.tsx');
const css = read('app/accessibility-interaction.css');
const layout = read('app/layout.tsx');

const checks = [
  ['skip link targets main content', app.includes('href="#main-content"') && app.includes('id="main-content"')],
  ['manager toast is announced atomically', app.includes('role="status" aria-live="polite" aria-atomic="true"')],
  ['topbar triggers expose expanded state and controls', app.includes('aria-expanded={searchOpen}') && app.includes('aria-expanded={notificationsOpen}')],
  ['shared dialog traps focus, closes on Escape and restores focus', dialog.includes('event.key === "Escape"') && dialog.includes('previouslyFocused?.focus()') && dialog.includes('event.key !== "Tab"')],
  ['employee more sheet traps focus and supports Escape', employeeShell.includes("event.key==='Escape'") && employeeShell.includes("event.key!=='Tab'") && employeeShell.includes('aria-controls="employee-more-sheet"')],
  ['global focus-visible contract exists', css.includes(':focus-visible') && css.includes('outline:3px solid')],
  ['reduced motion is respected', css.includes('prefers-reduced-motion: reduce')],
  ['forced colors are supported', css.includes('forced-colors: active')],
  ['accessibility stylesheet is loaded', layout.includes('accessibility-interaction.css')],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
if (failed.length) process.exit(1);
console.log('v0.18.14 accessibility and interaction QA regression passed.');
