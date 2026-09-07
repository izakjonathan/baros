import { OperationModule } from "@/features/operation/OperationModule";
import { defaultOperationState } from "@/features/operation/default-content";
import { mapOperationArticle, ownerCanManageOperation } from "@/features/operation/content";
import type { OperationDailyTask, OperationModuleState, OperationNeed } from "@/features/operation/types";
import { isDevAuthEnabled } from "@/lib/auth/dev-auth";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";

export default async function OperationPage() {
  const user = await requireUser();
  const devMode = isDevAuthEnabled();
  if (devMode) {
    return <OperationModule initialState={{ ...defaultOperationState, userRole: user.role, canManageContent: ownerCanManageOperation(user.role) }} devMode />;
  }

  const today = new Date().toISOString().slice(0, 10);
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
  const [articles, tasks, needs] = await Promise.all([
    db()<Array<Record<string, unknown>>>`
      select id,kind,category,title,description,content,published,updated_at
      from operation_articles
      where organization_id=${user.organizationId} and published=true
      order by kind,category,sort_order,updated_at desc`,
    db()<Array<Record<string, unknown>>>`
      select t.id,t.weekday,t.title,t.description,(c.completed_at is not null) completed
      from operation_daily_tasks t
      left join operation_daily_task_completions c
        on c.task_id=t.id and c.service_date=${today}::date and c.organization_id=t.organization_id
      where t.organization_id=${user.organizationId}
        and (${user.locationId}::uuid is null or t.location_id is null or t.location_id=${user.locationId})
        and t.weekday=${weekday}
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
  ]);

  const handbook = articles.filter(article => article.kind === "HANDBOOK").map(mapOperationArticle);
  const news = articles.filter(article => article.kind === "NEWS").map(mapOperationArticle);
  const initialState: OperationModuleState = {
    userRole: user.role,
    canManageContent: ownerCanManageOperation(user.role),
    today,
    handbook,
    news,
    dailyTasks: tasks.map((task): OperationDailyTask => ({
      id: String(task.id),
      weekday: Number(task.weekday),
      title: String(task.title),
      description: String(task.description || ""),
      completed: Boolean(task.completed),
    })),
    needs: needs.map((need): OperationNeed => ({
      id: String(need.id),
      title: String(need.title),
      note: need.note == null ? null : String(need.note),
      status: String(need.status) === "ORDERED" ? "ORDERED" : "NEEDED",
      createdAt: String(need.created_at),
    })),
  };

  return <OperationModule initialState={initialState} devMode={false} />;
}
