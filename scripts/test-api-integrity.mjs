import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const orders = read("app/api/orders/route.ts");
const payroll = read("app/api/payroll-periods/route.ts");
for (const [name, source] of [["orders", orders], ["payroll", payroll]]) {
  if (!source.includes("db().begin")) throw new Error(`${name} mutation is not transactional`);
  if (!source.includes("insert into audit_logs")) throw new Error(`${name} audit is not written in route transaction`);
}
if (orders.includes("writeAudit(") || payroll.includes("writeAudit(")) throw new Error("audit write remains outside transaction");

for (const file of [
  "app/api/attendance-alerts/route.ts",
  "app/api/schedule-templates/route.ts",
  "app/api/security/route.ts",
]) {
  const source = read(file);
  if (source.includes(".json()")) throw new Error(`${file} still uses unbounded Request.json()`);
  if (!source.includes("readJsonObject")) throw new Error(`${file} does not use the bounded JSON parser`);
  if (!source.includes("jsonError(error, request)")) throw new Error(`${file} does not preserve request-aware error responses`);
}
const templates = read("app/api/schedule-templates/route.ts");
if (!templates.includes("requireOrganizationLocation")) throw new Error("schedule templates do not validate organization location scope");
const security = read("app/api/security/route.ts");
for (const token of ["SECURITY_ACTIONS", "GDPR_REQUEST_TYPES", "enumValue", "uuid(body.sessionId"]) {
  if (!security.includes(token)) throw new Error(`security action validation is missing ${token}`);
}

const scope = read("lib/auth/scope.ts");
if (!scope.includes("export type SqlRow = Record<string, unknown>")) throw new Error("scope query rows are not typed");
if (!scope.includes('import type { Sql } from "postgres"')) throw new Error("scope executor does not use the postgres Sql contract");
if (!scope.includes("export type SqlExecutor = Sql<{}>")) throw new Error("scope executor is not compatible with postgres transactions");
for (const file of ["app/api/orders/route.ts", "app/api/payroll-periods/route.ts"]) {
  const source = read(file);
  if (source.includes("tx as any")) throw new Error(`${file} still casts the transaction to any`);
}
if (payroll.includes("let rows: any[]")) throw new Error("payroll transaction rows still use any[]");

console.log("API boundary, transaction, and type-safety contract passed");
