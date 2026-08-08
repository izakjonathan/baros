import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const employeeShell = read('app/employee/employee-shell.tsx');
const employeeCss = read('app/employee/EmployeeWorkspace.css');
const managerApp = read('components/bar-ops-app.tsx');
const chrome = read('components/shell/workspace-chrome.tsx');
const requestForm = read('app/employee/request-form.tsx');
const packageJson = JSON.parse(read('package.json'));

const checks = [
  ['rc10 version is current', packageJson.version === '0.19.0-rc.10'],
  ['manager and employee both use shared sidebar', managerApp.includes('WorkspaceSidebar') && employeeShell.includes('WorkspaceSidebar')],
  ['manager and employee both use shared topbar', managerApp.includes('WorkspaceTopbar') && employeeShell.includes('WorkspaceTopbar')],
  ['shared chrome owns manager shell module', chrome.includes('ManagerShell.module.css')],
  ['employee bottom nav was removed', !employeeShell.includes('employee-nav') && !employeeCss.includes('.employee-nav')],
  ['employee more sheet was removed', !employeeShell.includes('employee-more-sheet') && !employeeCss.includes('.employee-more-sheet')],
  ['employee workspace starts in dark mode', employeeShell.includes('useState<"light" | "dark">("dark")') && employeeShell.includes('document.documentElement.dataset.theme = "dark"')],
  ['employee uses role-aware shared navigation', employeeShell.includes('employeeItems') && employeeShell.includes('router.push(item.href)')],
  ['linked managers retain employee capability layout', read('app/employee/layout.tsx').includes('requireCapability("employee.self_service")')],
  ['employee request dates use shared native datetime field', requestForm.includes('NativeDateTimeField')],
  ['employee shell route surface is dark', employeeCss.includes('.employee-app .employee-page-wrap { background: #000') || employeeCss.includes('.employee-app .employee-page-wrap { background: #000;')],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
if (failed.length) process.exit(1);
console.log('v0.19.0-rc.10 employee workspace shell unification regression passed.');
