import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const read = (file) => fs.readFileSync(file, "utf8");

const login = read("app/api/auth/login/route.ts");
const logout = read("app/api/auth/logout/route.ts");
const password = read("lib/auth/password.ts");
for (const token of ["verifyPasswordOrDummy", "requestId", "cache-control", "x-request-id"]) {
  if (!login.includes(token)) throw new Error(`login missing ${token}`);
}
for (const token of ["requestId", "cache-control", "x-request-id"]) {
  if (!logout.includes(token)) throw new Error(`logout missing ${token}`);
}
if (!password.includes("DUMMY_PASSWORD_HASH")) throw new Error("dummy hash missing");

const activation = read("app/api/auth/activate/route.ts");
const devLogin = read("app/api/auth/dev-login/route.ts");
for (const source of [activation, devLogin]) {
  assert.match(source, /requestIdFrom\(request\)/);
  assert.match(source, /cache-control/);
  assert.match(source, /x-request-id/);
}
assert.match(activation, /requestId/);
assert.match(devLogin, /response\.headers\.set\("x-request-id", requestId\)/);

const scope = read("lib/auth/scope.ts");
const orders = read("app/api/orders/route.ts");
const payroll = read("app/api/payroll-periods/route.ts");
for (const value of ["organization_id=${organizationId}", "Location is unavailable for this organization"]) {
  if (!scope.includes(value)) throw new Error(`missing scope guard: ${value}`);
}
for (const value of ["requireOrganizationLocation", "requireOrganizationEntity", "supplierId", "productId"]) {
  if (!orders.includes(value)) throw new Error(`orders missing tenant guard: ${value}`);
}
if (!payroll.includes("requireOrganizationLocation")) throw new Error("payroll create location is not tenant-scoped");

const capabilitySource = read("lib/auth/capabilities.ts");
const compiledCapabilities = ts.transpileModule(capabilitySource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const capabilityModule = { exports: {} };
vm.runInNewContext(compiledCapabilities, { module: capabilityModule, exports: capabilityModule.exports });
const { hasCapability, rolesWithCapability } = capabilityModule.exports;

assert.equal(typeof hasCapability, "function", "hasCapability must remain executable");
assert.equal(typeof rolesWithCapability, "function", "rolesWithCapability must remain executable");

const roles = ["OWNER", "ADMIN", "MANAGER", "SHIFT_MANAGER", "EMPLOYEE"];
const capabilities = [
  "manager.workspace", "operations.read", "operations.manage", "schedule.read", "schedule.edit",
  "schedule.publish", "schedule.templates.manage", "attendance.read", "attendance.manage", "payroll.read",
  "payroll.manage", "payroll.export", "requests.review", "inventory.read", "inventory.adjust", "orders.manage",
  "team.read", "team.manage", "accounts.invite", "settings.read", "settings.manage", "security.manage",
  "control.read", "employee.self_service",
];
const declaredCapabilities = [...capabilitySource.matchAll(/^\s*\|\s*"([^"]+)"/gm)].map((match) => match[1]);
assert.deepEqual(declaredCapabilities, capabilities, "the tested capability table must cover every declared capability");

const expectedByRole = {
  OWNER: capabilities,
  ADMIN: capabilities,
  MANAGER: capabilities.filter((capability) => capability !== "security.manage"),
  SHIFT_MANAGER: [
    "manager.workspace", "operations.read", "operations.manage", "schedule.read", "schedule.edit",
    "schedule.publish", "attendance.read", "attendance.manage", "payroll.read", "requests.review",
    "inventory.read", "inventory.adjust", "orders.manage", "team.read", "settings.read", "control.read",
    "employee.self_service",
  ],
  EMPLOYEE: ["employee.self_service"],
};

for (const role of roles) {
  for (const capability of capabilities) {
    assert.equal(
      hasCapability(role, capability),
      expectedByRole[role].includes(capability),
      `${role} capability mismatch for ${capability}`,
    );
  }
}
for (const capability of capabilities) {
  const expectedRoles = roles.filter((role) => expectedByRole[role].includes(capability)).sort();
  assert.deepEqual([...rolesWithCapability(capability)].sort(), expectedRoles, `role lookup mismatch for ${capability}`);
}

const authorizationSurfaces = new Map([
  ["app/api/orders/route.ts", ["orders.manage"]],
  ["app/api/products/route.ts", ["inventory.read", "inventory.adjust"]],
  ["app/api/requests/route.ts", ["requests.review", "employee.self_service"]],
  ["app/api/shift-claims/route.ts", ["requests.review", "employee.self_service"]],
  ["app/api/shift-transfers/route.ts", ["requests.review", "employee.self_service"]],
  ["app/api/shift-notes/route.ts", ["schedule.edit", "employee.self_service"]],
  ["app/api/shifts/route.ts", ["schedule.read", "schedule.edit"]],
  ["app/api/timesheets/route.ts", ["attendance.read", "attendance.manage", "employee.self_service"]],
  ["app/api/employee/timesheet-corrections/route.ts", ["attendance.manage", "employee.self_service"]],
  ["app/api/audit/route.ts", ["control.read"]],
  ["features/settings/SettingsWorkspace.tsx", ["settings.manage"]],
  ["lib/services/notifications.ts", ["requests.review"]],
]);
for (const [file, requiredCapabilities] of authorizationSurfaces) {
  const source = read(file);
  assert.match(source, /hasCapability|requireCapability|rolesWithCapability/, `${file} must use the capability model`);
  for (const capability of requiredCapabilities) assert.ok(source.includes(`"${capability}"`), `${file} missing ${capability}`);
  assert.doesNotMatch(source, /role\s*(?:===|!==)\s*["']EMPLOYEE["']/, `${file} retains an employee authorization shortcut`);
  assert.doesNotMatch(source, /\[\s*["']OWNER["'][^\]]*["']SHIFT_MANAGER["']\s*\]/s, `${file} retains a management role array`);
}
assert.match(read("app/api/shift-transfers/route.ts"), /typeof body\.accept === "boolean"/, "employee transfer responses must be selected by operation, not account role");
assert.match(read("features/settings/SettingsWorkspace.tsx"), /userRole: AppRole/, "settings must receive a typed application role");

console.log(`Authentication, tenant scope, and ${roles.length * capabilities.length}-cell capability matrix passed`);
