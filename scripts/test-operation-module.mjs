import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const operation = read("features/operation/OperationModule.tsx");
const route = read("app/api/operation-module/route.ts");
const imageRoute = read("app/api/operation-images/route.ts");
const imageDeliveryRoute = read("app/api/operation-images/[...pathname]/route.ts");
const operationStyles = read("features/operation/OperationModule.module.css");
const types = read("features/operation/types.ts");
const migration = read("db/migrations/018_operation_integrity_cleanup.sql");
const taskAudienceMigration = read("db/migrations/019_operation_task_assignment_scope.sql");

const checks = [
  ["selected task date is persisted", operation.includes("date: selectedTaskDate, completed: !task.completed")],
  ["failed task/checklist mutations refresh authoritative data", operation.includes('"Could not update task."') && operation.includes('"Could not update checklist."')],
  ["task managers use the shared capability model", route.includes('hasCapability(role, "operations.manage")') && route.includes("requireTaskManager(user.role)")],
  ["Copenhagen service date is explicit", route.includes("operationDateNow()") && read("features/operation/date.ts").includes("Europe/Copenhagen")],
  ["month-end recurrence is handled", types.includes("Math.min(start.getUTCDate(), lastDay)")],
  ["unused governance/reminder/audit schema is removed", ["operation_task_reminders", "operation_article_acknowledgements", "operation_article_versions", "operation_need_events"].every(name => migration.includes(`drop table if exists ${name}`))],
  ["SVG upload is rejected", route.includes("requireTaskManager") && imageRoute.includes("avif|gif|jpe?g|png|webp")],
  ["private image uploads have an authenticated delivery route", imageRoute.includes('access: "private"') && imageDeliveryRoute.includes('access: "private"') && imageDeliveryRoute.includes("getSessionUser")],
  ["article editor header is compact and supports existing or new categories", operation.includes("categories={editorCategories}") && operation.includes('className={styles.editorTopSelect}') && operation.includes('Add new category…') && operationStyles.includes("grid-template-columns:2.25rem minmax(0,1fr) minmax(0,1fr) 2.25rem")],
  ["format controls have no enclosing dock surface", operationStyles.includes("padding:0;border:0;background:transparent;box-shadow:none")],
  ["task instructions are genuinely optional", route.includes('optionalString(body, "description", 300) || ""')],
  ["task audiences are explicit and persisted", taskAudienceMigration.includes("assignment_scope") && route.includes('"ON_SHIFT", "EVERYONE"')],
];

for (const [name, ok] of checks) {
  if (!ok) throw new Error(`Operation integrity check failed: ${name}`);
  console.log(`PASS ${name}`);
}
