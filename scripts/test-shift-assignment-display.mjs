import fs from 'node:fs';
const api = fs.readFileSync('app/api/shifts/route.ts', 'utf8');
const ui = fs.readFileSync('components/bar-ops-app.tsx', 'utf8');
const checks = [
  [api.includes("first_name||' '||last_name as employee_name"), 'shift API resolves employee display name'],
  [api.includes('created.push({ ...rows[0], employee_name: employeeName })'), 'created shifts return employee_name'],
  [api.includes('updated.push({ ...changed[0], employee_name: employeeName })'), 'updated shifts return employee_name'],
  [ui.includes('x.employee_name || "Unassigned"'), 'UI maps returned employee_name'],
];
for (const [ok, label] of checks) {
  if (!ok) { console.error(`FAIL: ${label}`); process.exit(1); }
  console.log(`PASS: ${label}`);
}
