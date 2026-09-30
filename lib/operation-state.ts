import "server-only";

import { mapOperationArticle, ownerCanManageOperation } from "@/features/operation/content";
import {
  isOperationTaskDue,
  parseOperationTaskChecklist,
  parseOperationTaskImages,
  type OperationCashCount,
  type OperationDailyTask,
  type OperationMetrics,
  type OperationModuleState,
  type OperationNeed,
  type OperationTaskPriority,
  type OperationTaskTemplate,
  type OperationTaskType,
} from "@/features/operation/types";
import { hasCapability } from "@/lib/auth/capabilities";
import { db } from "@/lib/db/client";

export type OperationUserScope = {
  organizationId: string;
  locationId: string | null;
  employeeId: string | null;
  role: Parameters<typeof hasCapability>[0];
};

export function canManageOperationTasks(role: OperationUserScope["role"]) {
  return hasCapability(role, "operations.manage");
}

export function mapOperationTask(task: Record<string, unknown>): OperationDailyTask {
  return {
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
    checklist: parseOperationTaskChecklist(task.checklist, task.checklist_completed),
    images: parseOperationTaskImages(task.images),
    completed: Boolean(task.completed),
  };
}

export function mapOperationNeed(need: Record<string, unknown>): OperationNeed {
  return {
    id: String(need.id),
    title: String(need.title),
    note: need.note == null ? null : String(need.note),
    status: ["ORDERED", "RESOLVED", "DISMISSED"].includes(String(need.status)) ? String(need.status) as OperationNeed["status"] : "NEEDED",
    createdAt: String(need.created_at),
    updatedAt: String(need.updated_at || need.created_at),
    type: ["NEW_ITEM", "ISSUE"].includes(String(need.reminder_type)) ? String(need.reminder_type) as OperationNeed["type"] : "RESTOCK",
    stockLevel: ["LOW", "OUT_OF"].includes(String(need.stock_level)) ? String(need.stock_level) as OperationNeed["stockLevel"] : null,
  };
}

export function mapOperationCashCount(count: Record<string, unknown>): OperationCashCount {
  return {
    id: String(count.id),
    operationalDate: String(count.operational_date),
    tillAmount: count.till_amount == null ? null : Number(count.till_amount),
    changeBoxAmount: count.change_box_amount == null ? null : Number(count.change_box_amount),
    countedByName: String(count.counted_by_name),
    createdAt: String(count.created_at),
  };
}

function operationMetrics(tasks: Array<Record<string, unknown>>, needs: Array<Record<string, unknown>>, date: string): OperationMetrics {
  const due = tasks.filter(task => isOperationTaskDue({
    dueDate: String(task.due_date),
    repeatUnit: String(task.repeat_unit) as OperationDailyTask["repeatUnit"],
    repeatInterval: Number(task.repeat_interval),
    repeatEndDate: task.repeat_end_date == null ? null : String(task.repeat_end_date),
  }, date));
  const completed = due.filter(task => Boolean(task.completed_at)).length;
  return {
    completionRate: due.length ? Math.round(completed / due.length * 100) : 100,
    completedCount: completed,
    dueCount: due.length,
    overdueCount: 0,
    openNeedsCount: needs.filter(need => need.status === "NEEDED").length,
    overdueNeedsCount: 0,
  };
}

export async function loadOperationTasks(user: OperationUserScope, date: string) {
  const tasks = await db()<Array<Record<string, unknown>>>`
    select t.id,t.weekday,t.title,t.description,t.due_date::text due_date,t.repeat_unit,t.repeat_interval,t.repeat_end_date::text repeat_end_date,t.task_type,t.priority,t.due_time,t.reminder_minutes,t.assignment_scope,t.assigned_employee_id,t.checklist,t.images,
           coalesce((select jsonb_object_agg(cc.item_id,true) from operation_task_checklist_completions cc where cc.task_id=t.id and cc.service_date=${date}::date), '{}'::jsonb) checklist_completed,
           (a.first_name||' '||a.last_name) assigned_employee_name,
           (completed_employee.first_name||' '||completed_employee.last_name) completed_by_name,
           c.completed_at,(c.completed_at is not null) completed
    from operation_daily_tasks t
    left join operation_daily_task_completions c on c.task_id=t.id and c.service_date=${date}::date and c.organization_id=t.organization_id
    left join employees a on a.id=t.assigned_employee_id and a.organization_id=t.organization_id
    left join employees completed_employee on completed_employee.user_id=c.completed_by and completed_employee.organization_id=t.organization_id
    where t.organization_id=${user.organizationId}
      and (${user.locationId}::uuid is null or t.location_id is null or t.location_id=${user.locationId})
      and t.active=true
      and (${canManageOperationTasks(user.role)}
        or t.assignment_scope='EVERYONE'
        or (t.assignment_scope='EMPLOYEE' and t.assigned_employee_id=${user.employeeId}::uuid)
        or (t.assignment_scope='ON_SHIFT' and ${user.employeeId}::uuid is not null and exists(
          select 1 from shifts s where s.organization_id=t.organization_id and s.location_id=t.location_id and s.employee_id=${user.employeeId}
            and s.status in ('PUBLISHED','CONFIRMED')
            and s.starts_at < (${date}::date + interval '1 day')::timestamp at time zone 'Europe/Copenhagen'
            and s.ends_at > ${date}::date::timestamp at time zone 'Europe/Copenhagen'
        )))
    order by t.sort_order,t.created_at`;
  return tasks.map(mapOperationTask).filter(task => isOperationTaskDue(task, date));
}

export async function loadOperationState(user: OperationUserScope, date: string): Promise<OperationModuleState> {
  const [articles, dailyTasks, needs, assignees, taskTemplates, cashCounts] = await Promise.all([
    db()<Array<Record<string, unknown>>>`
      select id,kind,category,title,description,content,published,created_at,updated_at
      from operation_articles
      where organization_id=${user.organizationId} and archived_at is null and (published=true or ${ownerCanManageOperation(user.role)})
      order by case when kind='NEWS' then updated_at end desc,kind,category,sort_order,updated_at desc`,
    loadOperationTasks(user, date),
    db()<Array<Record<string, unknown>>>`
      select id,title,note,status,created_at,updated_at,reminder_type,stock_level
      from operation_needs where organization_id=${user.organizationId}
        and (${user.locationId}::uuid is null or location_id is null or location_id=${user.locationId})
      order by (status='NEEDED') desc,reminder_type,created_at desc limit 150`,
    db()<Array<Record<string, unknown>>>`
      select e.id,e.first_name||' '||e.last_name name from employees e
      where e.organization_id=${user.organizationId} and e.active=true
        and (${user.locationId}::uuid is null or exists(select 1 from employee_locations el where el.employee_id=e.id and el.location_id=${user.locationId}))
      order by e.first_name,e.last_name`,
    db()<Array<Record<string, unknown>>>`
      select id,title,description,task_type,priority,due_time,reminder_minutes,checklist
      from operation_task_templates where organization_id=${user.organizationId}
        and (${user.locationId}::uuid is null or location_id is null or location_id=${user.locationId})
      order by task_type,title`,
    db()<Array<Record<string, unknown>>>`
      select id,operational_date::text operational_date,till_amount,change_box_amount,counted_by_name,created_at
      from operation_cash_counts where organization_id=${user.organizationId}
        and (${user.locationId}::uuid is null or location_id is null or location_id=${user.locationId})
      order by operational_date desc,created_at desc limit 100`,
  ]);
  const handbook = articles.filter(article => article.kind === "HANDBOOK").map(mapOperationArticle);
  const news = articles.filter(article => article.kind === "NEWS").map(mapOperationArticle)
    .sort((left, right) => new Date(right.updatedAt).valueOf() - new Date(left.updatedAt).valueOf());
  const mappedNeeds = needs.map(mapOperationNeed);
  return {
    userRole: user.role,
    canManageContent: ownerCanManageOperation(user.role),
    canManageTasks: canManageOperationTasks(user.role),
    storageStatus: "ready",
    today: date,
    handbook,
    news,
    dailyTasks,
    assignees: assignees.map(assignee => ({ id: String(assignee.id), name: String(assignee.name) })),
    taskTemplates: taskTemplates.map((template): OperationTaskTemplate => ({
      id: String(template.id), title: String(template.title), description: String(template.description || ""),
      taskType: String(template.task_type) as OperationTaskType,
      priority: String(template.priority) as OperationTaskPriority,
      dueTime: template.due_time == null ? null : String(template.due_time).slice(0, 5),
      reminderMinutes: template.reminder_minutes == null ? null : Number(template.reminder_minutes),
      checklist: parseOperationTaskChecklist(template.checklist).map(({ id, label }) => ({ id, label })),
    })),
    metrics: operationMetrics(dailyTasks.map(task => ({ ...task, due_date: task.dueDate, repeat_unit: task.repeatUnit, repeat_interval: task.repeatInterval, repeat_end_date: task.repeatEndDate, completed_at: task.completed ? "yes" : null })), needs, date),
    needs: mappedNeeds,
    cashCounts: cashCounts.map(mapOperationCashCount),
  };
}
