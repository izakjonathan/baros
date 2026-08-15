import fs from "node:fs";
const scope = fs.readFileSync("lib/auth/scope.ts", "utf8");
if (!scope.includes("export type SqlRow = Record<string, unknown>")) throw new Error("scope query rows are not typed");
if (!scope.includes('import type { Sql } from "postgres"')) throw new Error("scope executor does not use the postgres Sql contract");
if (!scope.includes("export type SqlExecutor = Sql<{}>")) throw new Error("scope executor is not compatible with postgres transactions");
for (const file of ["app/api/orders/route.ts", "app/api/payroll-periods/route.ts"]) {
  const source = fs.readFileSync(file, "utf8");
  if (source.includes("tx as any")) throw new Error(`${file} still casts the transaction to any`);
}
const payroll = fs.readFileSync("app/api/payroll-periods/route.ts", "utf8");
if (payroll.includes("let rows: any[]")) throw new Error("payroll transaction rows still use any[]");
console.log("v0.16.19 type-safety stabilization checks passed");
