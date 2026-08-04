import fs from "node:fs";
const migration = fs.readFileSync("scripts/migrate.mjs", "utf8");
const workflow = fs.readFileSync(".github/workflows/database-admin.yml", "utf8");
const checks = [
  [workflow.includes("node-version: 24"), "database administration uses Node 24"],
  [!workflow.includes("node-version: 22"), "database administration no longer uses Node 22"],
  [migration.includes("pg_advisory_lock"), "migrations obtain a PostgreSQL advisory lock"],
  [migration.includes("pg_advisory_unlock"), "migration advisory lock is released"],
  [migration.includes('application_name: "baros-migrate"'), "migration connections are identifiable"],
  [migration.includes("statement_timeout: 120_000"), "migration statements have a timeout"],
  [migration.includes("lock_timeout: 10_000"), "migration lock waits have a timeout"],
  [migration.includes("finally"), "migration connection cleanup runs on failure"],
];
for (const [ok, label] of checks) { if (!ok) throw new Error(`FAIL: ${label}`); console.log(`PASS: ${label}`); }
