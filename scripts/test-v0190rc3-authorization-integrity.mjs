import fs from "node:fs";
import path from "node:path";

const failures = [];
const read = (file) => fs.readFileSync(file, "utf8");
const pkg = JSON.parse(read("package.json"));
const capabilities = read("lib/auth/capabilities.ts");
const session = read("lib/auth/session.ts");

if (pkg.version !== "0.19.0-rc.3") failures.push("package version is not 0.19.0-rc.3");

const owner = capabilities.match(/OWNER:\s*ownerAdminCapabilities/);
const admin = capabilities.match(/ADMIN:\s*ownerAdminCapabilities/);
if (!owner || !admin) failures.push("Owner and Admin are not sourced from the same capability set");

const shiftManagerBlock = capabilities.match(/SHIFT_MANAGER:\s*\[([\s\S]*?)\],\n\s*EMPLOYEE:/)?.[1] || "";
for (const required of ["operations.manage", "schedule.edit", "schedule.publish", "attendance.manage", "requests.review"]) {
  if (!shiftManagerBlock.includes(`"${required}"`)) failures.push(`Shift Manager missing ${required}`);
}
for (const forbidden of ["team.manage", "accounts.invite", "payroll.manage", "payroll.export", "schedule.templates.manage", "settings.manage", "security.manage"]) {
  if (shiftManagerBlock.includes(`"${forbidden}"`)) failures.push(`Shift Manager must not have ${forbidden}`);
}

if (!session.includes("employee.id as \"employeeId\"")) failures.push("linked employee identity is not loaded into authenticated sessions");
if (!read("app/employee/layout.tsx").includes('requireCapability("employee.self_service")')) failures.push("employee portal capability guard missing");

const routeContracts = {
  "app/api/manager/bootstrap/route.ts": ["manager.workspace"],
  "app/api/attendance-alerts/route.ts": ["attendance.read", "attendance.manage"],
  "app/api/time-clock/manage/route.ts": ["attendance.manage"],
  "app/api/timesheets/route.ts": ["attendance.manage"],
  "app/api/timesheets/export/route.ts": ["payroll.export"],
  "app/api/payroll-periods/route.ts": ["payroll.read", "payroll.manage"],
  "app/api/payroll-exports/route.ts": ["payroll.read", "payroll.export"],
  "app/api/schedule-publish/route.ts": ["schedule.publish"],
  "app/api/schedule-templates/route.ts": ["schedule.read", "schedule.templates.manage"],
  "app/api/schedule-acknowledgements/route.ts": ["schedule.read", "schedule.publish"],
  "app/api/operations/route.ts": ["operations.read", "operations.manage"],
  "app/api/operation-checklists/route.ts": ["operations.read", "operations.manage"],
  "app/api/employee-invitations/route.ts": ["accounts.invite"],
  "app/api/settings/time-clock/route.ts": ["settings.read", "settings.manage"],
  "app/api/security/route.ts": ["security.manage"],
};
for (const [file, required] of Object.entries(routeContracts)) {
  const source = read(file);
  for (const capability of required) {
    if (!source.includes(`requireCapability("${capability}")`)) failures.push(`${file} is not guarded by ${capability}`);
  }
}

const apiFiles = [];
function walk(directory) {
  for (const name of fs.readdirSync(directory)) {
    const target = path.join(directory, name);
    const stat = fs.statSync(target);
    if (stat.isDirectory()) walk(target);
    else if (name === "route.ts") apiFiles.push(target);
  }
}
walk("app/api");
for (const file of apiFiles) {
  const source = read(file);
  if (/requireUser\(\s*\[\s*["']OWNER/.test(source)) failures.push(`${file} still contains a hard-coded management role array`);
}

for (const migration of [
  "006_integrity_remediation.sql",
  "009_postgresql_integrity_completion.sql",
  "010_employee_activation_reliability.sql",
]) {
  if (!fs.existsSync(`db/migrations/${migration}`)) failures.push(`missing integrity migration ${migration}`);
}
const initialMigration = read("db/migrations/001_initial.sql");
const integrityMigration = read("db/migrations/009_postgresql_integrity_completion.sql");
if (!initialMigration.includes("create table audit_logs")) failures.push("initial migration missing audit_logs");
for (const marker of ["tenant_guard_", "payroll_periods"]) {
  if (!integrityMigration.includes(marker)) failures.push(`integrity migration missing ${marker}`);
}

for (const file of ["AUTHORIZATION_INTEGRITY_VERIFICATION.md", "EMPLOYEE_WORKSPACE_STATUS.md"]) {
  if (!fs.existsSync(file)) failures.push(`missing ${file}`);
}
if (!read("EMPLOYEE_WORKSPACE_STATUS.md").includes("not yet redesigned")) failures.push("employee workspace status is not explicit");

if (failures.length) {
  failures.forEach((failure) => console.error(`V0190RC3 ERROR: ${failure}`));
  process.exit(1);
}
console.log("v0.19.0-rc.3 authorization and integrity source regression passed");
