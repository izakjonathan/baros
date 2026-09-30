import { OperationModule } from "@/features/operation/OperationModule";
import { defaultOperationState } from "@/features/operation/default-content";
import { ownerCanManageOperation } from "@/features/operation/content";
import type { OperationModuleState } from "@/features/operation/types";
import { operationDateNow } from "@/features/operation/date";
import { isDevAuthEnabled } from "@/lib/auth/dev-auth";
import { hasCapability } from "@/lib/auth/capabilities";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { loadOperationState } from "@/lib/operation-state";
import { defaultTheme, getUiTheme } from "@/lib/ui-theme";

function isOperationSchemaUnavailable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: unknown; message?: unknown };
  const code = String(record.code || "");
  const message = String(record.message || "");
  return (code === "42P01" || code === "42704") && /operation_(articles|daily_tasks|daily_task_completions|needs|cash_counts|article_kind|need_status|task_templates|task_checklist_completions)/i.test(message)
    || code === "42703" && /(task_type|priority|due_time|reminder_minutes|assigned_employee_id|assignment_scope|checklist|images|reminder_type|stock_level|archived_at|idempotency_key|expires_at|rotated_at)/i.test(message);
}

export default async function OperationPage() {
  const user = await requireUser();
  const devMode = isDevAuthEnabled();
  const today = operationDateNow();
  const initialTheme = await getUiTheme(user.organizationId).catch(() => defaultTheme);
  let publicUrl: string | undefined;
  const fallbackState: OperationModuleState = {
    ...defaultOperationState,
    userRole: user.role,
    canManageContent: ownerCanManageOperation(user.role),
    canManageTasks: hasCapability(user.role, "operations.manage"),
    storageStatus: "ready",
    today,
  };
  if (devMode) return <OperationModule initialState={fallbackState} initialTheme={initialTheme} devMode publicUrl={publicUrl} />;

  let initialState: OperationModuleState;
  try {
    const [publicAccess] = await db()<Array<{ access_token: string }>>`
      select access_token from operation_public_access
      where organization_id=${user.organizationId} and enabled=true and (expires_at is null or expires_at>now()) limit 1`;
    publicUrl = publicAccess ? `/operation/public/${publicAccess.access_token}` : undefined;
    initialState = await loadOperationState(user, today);
  } catch (error) {
    if (isOperationSchemaUnavailable(error)) {
      initialState = { ...fallbackState, storageStatus: "migration-required" };
    } else {
      throw error;
    }
  }
  return <OperationModule initialState={initialState} initialTheme={initialTheme} devMode={false} publicUrl={publicUrl} />;
}
