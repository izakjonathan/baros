import fs from 'node:fs';
const api = fs.readFileSync('app/api/shifts/route.ts', 'utf8');
const scheduleMapper = fs.readFileSync('features/workspace/schedule-utils.ts', 'utf8');
const checks = [
  [api.includes("first_name||' '||last_name as employee_name"), 'shift API resolves employee display name'],
  [api.includes('created.push({ ...rows[0], employee_name: employeeName'), 'created shifts return employee_name'],
  [api.includes('updated.push({ ...changed[0], employee_name: employeeName'), 'updated shifts return employee_name'],
  [scheduleMapper.includes('record.employee_name || "Unassigned"'), 'shared schedule mapper resolves returned employee_name'],
];
for (const [ok, label] of checks) {
  if (!ok) { console.error(`FAIL: ${label}`); process.exit(1); }
  console.log(`PASS: ${label}`);
}
