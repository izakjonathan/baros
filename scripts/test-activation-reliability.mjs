import fs from "node:fs";
const route = fs.readFileSync("app/api/auth/activate/route.ts", "utf8");
const store = fs.readFileSync("lib/auth/session-store.ts", "utf8");
const migration = fs.readFileSync("db/migrations/010_employee_activation_reliability.sql", "utf8");
const transactionStart = route.indexOf("db().begin");
const persistCall = route.indexOf("await persistSessionRecord");
const cookieSet = route.indexOf("store.set(sessionCookieName()" );
const checks = [
  ["atomic transaction", transactionStart >= 0],
  ["shared session persistence used", persistCall > transactionStart],
  ["cookie set after transaction", cookieSet > persistCall],
  ["shared session insert", store.includes("insert into sessions")],
  ["shared session retention", store.includes("offset ${retain}")],
  ["employee link verified", route.includes("EMPLOYEE_LINK_FAILED")],
  ["audit json serialized", route.includes("::jsonb") && route.includes("JSON.stringify")],
  ["RLS reliability migration", migration.includes("disable row level security")],
  ["schema compatibility", migration.includes("add column if not exists updated_at")],
];
const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? "✓" : "✗"} ${name}`);
if (failed.length) process.exit(1);
