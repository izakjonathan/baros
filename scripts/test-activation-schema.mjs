import fs from "node:fs";
const read = (path) => fs.readFileSync(path, "utf8");
const activation = read("app/api/auth/activate/route.ts");
const employeeApi = read("app/api/employees/route.ts");
const migration = read("db/migrations/008_employee_updated_at.sql");
const verify = read("scripts/verify-database.mjs");
const checks = [
  ["activation updates employee timestamp", activation.includes("update employees set user_id=${userId},updated_at=now()")],
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
