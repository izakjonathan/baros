import fs from "node:fs";

const failures = [];
const read = (file) => fs.readFileSync(file, "utf8");
const pkg = JSON.parse(read("package.json"));
const capabilities = read("lib/auth/capabilities.ts");
const session = read("lib/auth/session.ts");
const app = read("components/bar-ops-app.tsx");

if (pkg.version !== "0.19.0-rc.2") failures.push("package version is not 0.19.0-rc.2");
for (const term of [
  "OWNER: ownerAdminCapabilities",
  "ADMIN: ownerAdminCapabilities",
  "SHIFT_MANAGER:",
  '"team.read"',
  '"settings.read"',
  '"employee.self_service"',
]) if (!capabilities.includes(term)) failures.push(`capability model missing ${term}`);

const shiftManagerBlock = capabilities.match(/SHIFT_MANAGER:\s*\[([\s\S]*?)\],\n\s*EMPLOYEE:/)?.[1] || "";
for (const forbidden of ["team.manage", "accounts.invite", "payroll.manage", "payroll.export", "schedule.templates.manage", "settings.manage", "security.manage"]) {
  if (shiftManagerBlock.includes(`"${forbidden}"`)) failures.push(`shift manager must not have ${forbidden}`);
}
for (const required of ["operations.manage", "schedule.edit", "schedule.publish", "attendance.manage", "requests.review"]) {
  if (!shiftManagerBlock.includes(`"${required}"`)) failures.push(`shift manager missing operational capability ${required}`);
}
if (!session.includes("requireCapability(capability: Capability)")) failures.push("server capability guard missing");
if (!app.includes("availableNavItems = navItems.filter")) failures.push("manager navigation is not capability filtered");
if (!app.includes('hasCapability(userRole, "team.manage")')) failures.push("team action capability guard missing");
if (!app.includes('hasCapability(userRole, "payroll.manage")')) failures.push("payroll management guard missing");
if (!app.includes('hasCapability(userRole, "payroll.export")')) failures.push("payroll export guard missing");

const routeContracts = {
  "app/api/employees/route.ts": ["team.read", "team.manage"],
  "app/api/employee-invitations/route.ts": ["accounts.invite"],
  "app/api/payroll-periods/route.ts": ["payroll.read", "payroll.manage"],
  "app/api/payroll-exports/route.ts": ["payroll.read", "payroll.export"],
  "app/api/schedule-templates/route.ts": ["schedule.read", "schedule.templates.manage"],
  "app/api/settings/time-clock/route.ts": ["settings.read", "settings.manage"],
};
for (const [file, terms] of Object.entries(routeContracts)) {
  const source = read(file);
  for (const term of terms) if (!source.includes(term)) failures.push(`${file} missing ${term}`);
}
if (!read("app/employee/layout.tsx").includes('requireCapability("employee.self_service")')) failures.push("employee portal policy is not explicit");
for (const file of ["MASTER_DEVELOPMENT_BRIEF.md", "ROLE_CAPABILITY_MATRIX.md", "APPROVED_ROLE_DECISIONS.md"]) {
  if (!fs.existsSync(`docs/constitution/${file}`)) failures.push(`missing constitution alignment document ${file}`);
}

if (failures.length) {
  failures.forEach((failure) => console.error(`V0190RC2 ERROR: ${failure}`));
  process.exit(1);
}
console.log("v0.19.0-rc.2 capability alignment regression passed");
