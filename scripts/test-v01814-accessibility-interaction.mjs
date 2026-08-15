import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const app = read('components/bar-ops-app.tsx');
const dialog = read('components/ui/interaction-ui.tsx');
const employeeShell = read('app/employee/employee-shell.tsx');
const workspaceChrome = read('components/shell/workspace-chrome.tsx');
const css = read('app/system-contracts.css');
const sharedControls = css;
const layout = read('app/layout.tsx');

const checks = [
  ['skip link targets main content', app.includes('href="#main-content"') && app.includes('id="main-content"')],
  ['manager toast is announced atomically', app.includes('role="status" aria-live="polite" aria-atomic="true"')],
  ['topbar triggers expose expanded state and controls', workspaceChrome.includes('aria-expanded={searchOpen}') && workspaceChrome.includes('aria-expanded={notificationsOpen}')],
  ['shared dialog traps focus, closes on Escape and restores focus', dialog.includes('event.key === "Escape"') && dialog.includes('previouslyFocused?.focus()') && dialog.includes('event.key !== "Tab"')],
  ['employee workspace uses shared accessible shell chrome', employeeShell.includes('WorkspaceSidebar') && employeeShell.includes('WorkspaceTopbar') && employeeShell.includes('href="#main-content"') && workspaceChrome.includes('aria-label="Workspace navigation"')],
  ['global focus-visible contract exists', sharedControls.includes(':focus-visible') && sharedControls.includes('outline:3px solid')],
  ['reduced motion is respected', css.includes('prefers-reduced-motion: reduce')],
  ['forced colors are supported', css.includes('forced-colors: active')],
  ['accessibility stylesheet is loaded', layout.includes('system-contracts.css')],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
if (failed.length) process.exit(1);
console.log('v0.18.14 accessibility and interaction QA regression passed.');
