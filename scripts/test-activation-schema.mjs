import fs from "node:fs";
const read = (path) => fs.readFileSync(path, "utf8");
const activation = read("app/api/auth/activate/route.ts");
const employeeApi = read("app/api/employees/route.ts");
const migration = read("db/migrations/008_employee_updated_at.sql");
const verify = read("scripts/verify-database.mjs");
const checks = [
  ["activation updates employee timestamp", /update\s+employees[\s\S]*set[\s\S]*user_id\s*=\s*\$\{userId\}[\s\S]*updated_at\s*=\s*now\(\)/.test(activation)],
  ["employee edits update timestamp", employeeApi.includes("updated_at=now()")],
  ["schema adds employee updated_at", /alter table employees[\s\S]*add column if not exists updated_at/i.test(migration)],
  ["database verification requires migration 008", verify.includes("008_employee_updated_at.sql")],
];
let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) failed++;
}
if (failed) process.exit(1);
