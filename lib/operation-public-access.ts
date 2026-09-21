import { defaultOperationState } from "@/features/operation/default-content";
import { mapOperationArticle } from "@/features/operation/content";
import { isOperationTaskDue, type OperationDailyTask, type OperationModuleState, type OperationNeed } from "@/features/operation/types";
import { db } from "@/lib/db/client";

export type PublicOperationAccess = { organizationId: string; token: string };

export async function getPublicOperationAccess(token: string): Promise<PublicOperationAccess | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) return null;
  const [access] = await db()<Array<{ organization_id: string; access_token: string }>>`
    select organization_id,access_token from operation_public_access
    where access_token=${token}::uuid and enabled=true limit 1
  `;
  return access ? { organizationId: access.organization_id, token: access.access_token } : null;
}

export async function loadPublicOperationState(access: PublicOperationAccess, date: string): Promise<OperationModuleState> {
  const [articles, tasks, needs] = await Promise.all([
    db()<Array<Record<string, unknown>>>`
      select id,kind,category,title,description,content,published,updated_at
      from operation_articles where organization_id=${access.organizationId} and published=true
      order by kind,category,sort_order,updated_at desc`,
    db()<Array<Record<string, unknown>>>`
      select t.id,t.weekday,t.title,t.description,t.due_date::text due_date,t.repeat_unit,t.repeat_interval,t.repeat_end_date::text repeat_end_date,t.task_type,t.priority,t.due_time,t.reminder_minutes,t.assignment_scope,t.assigned_employee_id,t.checklist,
             coalesce((select jsonb_object_agg(cc.item_id,true) from operation_task_checklist_completions cc where cc.task_id=t.id and cc.service_date=${date}::date), '{}'::jsonb) checklist_completed,
             (c.completed_at is not null) completed
      from operation_daily_tasks t
      left join operation_daily_task_completions c on c.task_id=t.id and c.service_date=${date}::date and c.organization_id=t.organization_id
      where t.organization_id=${access.organizationId} and t.active=true and t.assignment_scope='EVERYONE'
      order by t.sort_order,t.created_at`,
    db()<Array<Record<string, unknown>>>`
      select id,title,note,status,created_at,updated_at,reminder_type,stock_level
      from operation_needs where organization_id=${access.organizationId}
      order by (status='NEEDED') desc,reminder_type,created_at desc limit 150`,
  ]);
  const dailyTasks = tasks.map((task): OperationDailyTask => ({
    id: String(task.id), weekday: Number(task.weekday), title: String(task.title), description: String(task.description || ""),
    dueDate: String(task.due_date), repeatUnit: String(task.repeat_unit) as OperationDailyTask["repeatUnit"], repeatInterval: Number(task.repeat_interval), repeatEndDate: task.repeat_end_date == null ? null : String(task.repeat_end_date), dueTime: task.due_time == null ? null : String(task.due_time).slice(0, 5), reminderMinutes: task.reminder_minutes == null ? null : Number(task.reminder_minutes), priority: String(task.priority) as OperationDailyTask["priority"], taskType: String(task.task_type) as OperationDailyTask["taskType"], assignmentScope: "EVERYONE", assignedEmployeeId: null, assignedEmployeeName: null, completedByName: null,
    checklist: Array.isArray(task.checklist) ? task.checklist.flatMap((item): OperationDailyTask["checklist"] => item && typeof item === "object" && "id" in item && "label" in item ? [{ id: String(item.id), label: String(item.label), completed: Boolean(task.checklist_completed && typeof task.checklist_completed === "object" && String(item.id) in task.checklist_completed) }] : []) : [], completed: Boolean(task.completed),
  })).filter(task => isOperationTaskDue(task, date));
  const mappedNeeds = needs.map((need): OperationNeed => ({ id: String(need.id), title: String(need.title), note: need.note == null ? null : String(need.note), status: ["ORDERED", "RESOLVED", "DISMISSED"].includes(String(need.status)) ? String(need.status) as OperationNeed["status"] : "NEEDED", createdAt: String(need.created_at), updatedAt: String(need.updated_at || need.created_at), type: ["NEW_ITEM", "ISSUE"].includes(String(need.reminder_type)) ? String(need.reminder_type) as OperationNeed["type"] : "RESTOCK", stockLevel: ["LOW", "OUT_OF"].includes(String(need.stock_level)) ? String(need.stock_level) as OperationNeed["stockLevel"] : null }));
  return { ...defaultOperationState, userRole: "EMPLOYEE", canManageContent: false, canManageTasks: false, storageStatus: "ready", today: date, handbook: articles.filter(article => article.kind === "HANDBOOK").map(mapOperationArticle), news: articles.filter(article => article.kind === "NEWS").map(mapOperationArticle), dailyTasks, assignees: [], taskTemplates: [], needs: mappedNeeds, metrics: { completionRate: dailyTasks.length ? Math.round(dailyTasks.filter(task => task.completed).length / dailyTasks.length * 100) : 100, completedCount: dailyTasks.filter(task => task.completed).length, dueCount: dailyTasks.length, overdueCount: 0, openNeedsCount: mappedNeeds.filter(need => need.status === "NEEDED").length, overdueNeedsCount: 0 } };
}
