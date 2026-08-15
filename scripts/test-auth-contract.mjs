import assert from "node:assert/strict";
import fs from "node:fs";

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

console.log("Authentication and tenant-scope contract passed");
