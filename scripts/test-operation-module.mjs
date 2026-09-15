import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const operation = read("features/operation/OperationModule.tsx");
const route = read("app/api/operation-module/route.ts");
const imageRoute = read("app/api/operation-images/route.ts");
const imageDeliveryRoute = read("app/api/operation-images/[...pathname]/route.ts");
const operationContent = read("features/operation/content.ts");
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
  ["private image uploads have an authenticated delivery route", imageRoute.includes('access: "private"') && imageRoute.includes("logServerError") && imageDeliveryRoute.includes('access: "private"') && imageDeliveryRoute.includes("getSessionUser")],
  ["uploaded private image paths persist in article content", operationContent.includes("operationImagePath") && operationContent.includes("isArticleImageSource(src)")],
  ["device images are resized before upload", operation.includes("async function prepareOperationImage") && operation.includes('canvas.toBlob(resolve, "image/webp", 0.82)') && operation.includes("imageUploadMaxDimension = 2048")],
  ["owner article management reuses Handbook cards", !operation.includes("function AdminPanel") && operation.includes("canManageContent={state.canManageContent}") && operation.includes("onEdit={canManageContent ? () => editArticle(article) : undefined}")],
  ["article editor header is compact and supports existing or new categories", operation.includes("categories={editorCategories}") && operation.includes('className={styles.editorTopSelect}') && operation.includes('Add new category…') && operationStyles.includes("grid-template-columns:2.25rem minmax(0,1fr) minmax(0,1fr) 2.25rem")],
  ["format controls have an equal-width visible dock", operationStyles.includes("grid-template-columns:repeat(8,minmax(0,1fr))") && operationStyles.includes("border-radius:999px;background:rgba(233,229,221,.96)")],
  ["article editor metadata does not inherit full-size form controls", operationStyles.includes(".editorTitleInput{box-sizing:border-box;display:block;min-height:1.55rem;margin:0;padding:0}") && operationStyles.includes(".editorDescriptionInput{box-sizing:border-box;display:block;min-height:1.4rem;margin:.1rem 0 .28rem;padding:0}")],
  ["format controls sit close to the visual viewport edge", operationStyles.includes("var(--editor-vv-height,100dvh) - 2.95rem")],
  ["format controls expose compact style and numbered-list buttons", operation.includes('aria-label="Text style"') && operation.includes('aria-label="Numbered list"')],
  ["format popovers close on outside interaction", operation.includes('document.addEventListener("pointerdown", closePopovers)')],
  ["article images are borderless", operationStyles.includes(".tiptapSurface :global(.tiptap img){display:block;max-width:100%;height:auto;margin:.85rem 0;border:0")],
  ["task date and time retain a two-column mobile layout", !operationStyles.includes(".moduleGrid,.adminGrid,.editorMeta,.taskSettings{grid-template-columns:1fr}" )],
  ["task instructions are genuinely optional", route.includes('optionalString(body, "description", 300) || ""')],
  ["task audiences are explicit and persisted", taskAudienceMigration.includes("assignment_scope") && route.includes('"ON_SHIFT", "EVERYONE"')],
  ["task audience is composed beside repeat", operation.includes('<Repeat2 size={15} />Repeat') && operation.includes('<label className={styles.taskAudienceField}><span className={styles.taskSettingLabel}><UserRound size={15} />Task audience')],
  ["task settings constrain native date and time controls", operationStyles.includes("contain:inline-size") && operationStyles.includes("max-inline-size:100%")],
  ["Operations keeps iPad touch inputs and the editor viewport safe", operation.includes("window.visualViewport") && operation.includes('visualViewport?.addEventListener("resize", syncViewport)') && operationStyles.includes("@media (hover:none) and (pointer:coarse)") && operationStyles.includes("font-size:16px")],
];

for (const [name, ok] of checks) {
  if (!ok) throw new Error(`Operation integrity check failed: ${name}`);
  console.log(`PASS ${name}`);
}
