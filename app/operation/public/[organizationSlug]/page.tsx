import { notFound } from "next/navigation";
import { OperationModule } from "@/features/operation/OperationModule";
import { mapOperationArticle } from "@/features/operation/content";
import { defaultOperationState } from "@/features/operation/default-content";
import type { OperationModuleState } from "@/features/operation/types";
import { db } from "@/lib/db/client";
import { defaultTheme, getUiTheme } from "@/lib/ui-theme";

type PageProps = { params: Promise<{ organizationSlug: string }> };

export const dynamic = "force-dynamic";

export default async function PublicOperationPage({ params }: PageProps) {
  const { organizationSlug } = await params;
  const [organization] = await db()<Array<{ id: string }>>`
    select id from organizations where slug=${organizationSlug} limit 1
  `;
  if (!organization) notFound();

  const [articles, initialTheme] = await Promise.all([
    db()<Array<Record<string, unknown>>>`
      select id,kind,category,title,description,content,published,updated_at
      from operation_articles
      where organization_id=${organization.id} and published=true
      order by kind,category,sort_order,updated_at desc`,
    getUiTheme(organization.id).catch(() => defaultTheme),
  ]);
  const initialState: OperationModuleState = {
    ...defaultOperationState,
    userRole: "EMPLOYEE",
    canManageContent: false,
    canManageTasks: false,
    storageStatus: "ready",
    handbook: articles.filter(article => article.kind === "HANDBOOK").map(mapOperationArticle),
    news: articles.filter(article => article.kind === "NEWS").map(mapOperationArticle),
    dailyTasks: [],
    assignees: [],
    taskTemplates: [],
    needs: [],
    metrics: { completionRate: 0, completedCount: 0, dueCount: 0, overdueCount: 0, openNeedsCount: 0, overdueNeedsCount: 0 },
  };

  return <OperationModule initialState={initialState} initialTheme={initialTheme} devMode={false} publicMode />;
}
