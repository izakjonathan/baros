import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const operation = read("features/operation/OperationModule.tsx");
const route = read("app/api/operation-module/route.ts");
const types = read("features/operation/types.ts");
const migration = read("db/migrations/018_operation_integrity_cleanup.sql");

const checks = [
  ["selected task date is persisted", operation.includes("date: selectedTaskDate, completed: !task.completed")],
  ["failed task/checklist mutations refresh authoritative data", operation.includes('"Could not update task."') && operation.includes('"Could not update checklist."')],
  ["task managers use the shared capability model", route.includes('hasCapability(role, "operations.manage")') && route.includes("requireTaskManager(user.role)")],
  ["Copenhagen service date is explicit", route.includes("operationDateNow()") && read("features/operation/date.ts").includes("Europe/Copenhagen")],
  ["month-end recurrence is handled", types.includes("Math.min(start.getUTCDate(), lastDay)")],
  ["unused governance/reminder/audit schema is removed", ["operation_task_reminders", "operation_article_acknowledgements", "operation_article_versions", "operation_need_events"].every(name => migration.includes(`drop table if exists ${name}`))],
  ["SVG upload is rejected", route.includes("requireTaskManager") && read("app/api/operation-images/route.ts").includes("avif|gif|jpe?g|png|webp")],
];

for (const [name, ok] of checks) {
  if (!ok) throw new Error(`Operation integrity check failed: ${name}`);
  console.log(`PASS ${name}`);
}
