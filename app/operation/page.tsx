import { OperationModule } from "@/features/operation/OperationModule";
import { defaultOperationState } from "@/features/operation/default-content";
import { mapOperationArticle, ownerCanManageOperation } from "@/features/operation/content";
import { isOperationTaskDue, type OperationDailyTask, type OperationModuleState, type OperationNeed } from "@/features/operation/types";
import { isDevAuthEnabled } from "@/lib/auth/dev-auth";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { operationDateNow } from "@/features/operation/date";
import { hasCapability } from "@/lib/auth/capabilities";
import { defaultTheme, getUiTheme } from "@/lib/ui-theme";

function isOperationSchemaUnavailable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: unknown; message?: unknown };
  const code = String(record.code || "");
  const message = String(record.message || "");
  return (code === "42P01" || code === "42704") && /operation_(articles|daily_tasks|daily_task_completions|needs|article_kind|need_status|task_templates|task_checklist_completions)/i.test(message)
    || code === "42703" && /(task_type|priority|due_time|reminder_minutes|assigned_employee_id|assignment_scope)/i.test(message);
}

export default async function OperationPage() {
  const user = await requireUser();
  const devMode = isDevAuthEnabled();
  const initialTheme = await getUiTheme(user.organizationId).catch(() => defaultTheme);
  const [organization] = devMode ? [] : await db()<Array<{ slug: string }>>`select slug from organizations where id=${user.organizationId} limit 1`;
  const publicUrl = organization ? `/operation/public/${organization.slug}` : undefined;
  const fallbackState: OperationModuleState = {
    ...defaultOperationState,
    userRole: user.role,
    canManageContent: ownerCanManageOperation(user.role),
    canManageTasks: hasCapability(user.role, "operations.manage"),
    storageStatus: "ready",
    today: operationDateNow(),
  };
  if (devMode) {
    return <OperationModule initialState={fallbackState} initialTheme={initialTheme} devMode publicUrl={publicUrl} />;
  }

  const today = operationDateNow();
  let articles: Array<Record<string, unknown>>;
  let tasks: Array<Record<string, unknown>>;
  let needs: Array<Record<string, unknown>>;
  let assignees: Array<Record<string, unknown>>;
  try {
    [articles, tasks, needs, assignees] = await Promise.all([
      db()<Array<Record<string, unknown>>>`
        select id,kind,category,title,description,content,published,updated_at
        from operation_articles
        where organization_id=${user.organizationId} and published=true
        order by kind,category,sort_order,updated_at desc`,
      db()<Array<Record<string, unknown>>>`
        select t.id,t.weekday,t.title,t.description,t.due_date,t.repeat_unit,t.repeat_interval,t.repeat_end_date,t.task_type,t.priority,t.due_time,t.reminder_minutes,t.assignment_scope,t.assigned_employee_id,
               (a.first_name||' '||a.last_name) assigned_employee_name,
               (completed_employee.first_name||' '||completed_employee.last_name) completed_by_name,
               (c.completed_at is not null) completed
        from operation_daily_tasks t
        left join operation_daily_task_completions c
          on c.task_id=t.id and c.service_date=${today}::date and c.organization_id=t.organization_id
        left join employees a on a.id=t.assigned_employee_id and a.organization_id=t.organization_id
        left join employees completed_employee on completed_employee.user_id=c.completed_by and completed_employee.organization_id=t.organization_id
        where t.organization_id=${user.organizationId}
          and (${user.locationId}::uuid is null or t.location_id is null or t.location_id=${user.locationId})
          and t.active=true
        order by t.sort_order,t.created_at`,
      db()<Array<Record<string, unknown>>>`
        select id,title,note,status,created_at
        from operation_needs
        where organization_id=${user.organizationId}
          and (${user.locationId}::uuid is null or location_id is null or location_id=${user.locationId})
          and status='NEEDED'
        order by created_at desc
        limit 100`,
      db()<Array<Record<string, unknown>>>`
        select e.id,e.first_name||' '||e.last_name name
        from employees e
        where e.organization_id=${user.organizationId} and e.active=true
          and (${user.locationId}::uuid is null or exists(select 1 from employee_locations el where el.employee_id=e.id and el.location_id=${user.locationId}))
        order by e.first_name,e.last_name`,
    ]);
  } catch (error) {
    if (isOperationSchemaUnavailable(error)) return <OperationModule initialState={{ ...fallbackState, storageStatus: "migration-required" }} initialTheme={initialTheme} devMode={false} publicUrl={publicUrl} />;
    throw error;
  }

  const handbook = articles.filter(article => article.kind === "HANDBOOK").map(mapOperationArticle);
  const news = articles.filter(article => article.kind === "NEWS").map(mapOperationArticle);
  const initialState: OperationModuleState = {
    userRole: user.role,
    canManageContent: ownerCanManageOperation(user.role),
    canManageTasks: hasCapability(user.role, "operations.manage"),
    storageStatus: "ready",
    today,
    handbook,
    news,
    dailyTasks: tasks.map((task): OperationDailyTask => ({
      id: String(task.id),
      weekday: Number(task.weekday),
      title: String(task.title),
      description: String(task.description || ""),
      dueDate: String(task.due_date),
      repeatUnit: String(task.repeat_unit) as OperationDailyTask["repeatUnit"],
      repeatInterval: Number(task.repeat_interval),
      repeatEndDate: task.repeat_end_date == null ? null : String(task.repeat_end_date),
      dueTime: task.due_time == null ? null : String(task.due_time).slice(0, 5),
      reminderMinutes: task.reminder_minutes == null ? null : Number(task.reminder_minutes),
      priority: String(task.priority) as OperationDailyTask["priority"],
      taskType: String(task.task_type) as OperationDailyTask["taskType"],
      assignmentScope: String(task.assignment_scope) as OperationDailyTask["assignmentScope"],
      assignedEmployeeId: task.assigned_employee_id == null ? null : String(task.assigned_employee_id),
      assignedEmployeeName: task.assigned_employee_name == null ? null : String(task.assigned_employee_name),
      completedByName: task.completed_by_name == null ? null : String(task.completed_by_name),
      checklist: [],
      completed: Boolean(task.completed),
    })).filter(task => isOperationTaskDue(task, today)),
    assignees: assignees.map(assignee => ({ id: String(assignee.id), name: String(assignee.name) })),
    taskTemplates: [],
    metrics: { completionRate: 0, completedCount: 0, dueCount: 0, overdueCount: 0, openNeedsCount: needs.filter(need => need.status === "NEEDED").length, overdueNeedsCount: 0 },
    needs: needs.map((need): OperationNeed => ({
      id: String(need.id),
      title: String(need.title),
      note: need.note == null ? null : String(need.note),
      status: String(need.status) === "ORDERED" ? "ORDERED" : "NEEDED",
      createdAt: String(need.created_at),
      quantity: null, unit: null, supplier: null, priority: "NORMAL", neededBy: null, orderedAt: null, orderedByName: null,
    })),
  };

  return <OperationModule initialState={initialState} initialTheme={initialTheme} devMode={false} publicUrl={publicUrl} />;
}
