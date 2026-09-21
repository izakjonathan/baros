import { NextResponse } from "next/server";
import { operationDateNow } from "@/features/operation/date";
import { db } from "@/lib/db/client";
import { ApiError, enumValue, isoDate, jsonError, optionalString, readJsonObject, requiredString, uuid } from "@/lib/http";
import { getPublicOperationAccess, loadPublicOperationState } from "@/lib/operation-public-access";

type RouteContext = { params: Promise<{ accessToken: string }> };

async function accessFor(params: RouteContext["params"]) {
  const { accessToken } = await params;
  const access = await getPublicOperationAccess(accessToken);
  if (!access) throw new ApiError(404, "Shared Operations link is unavailable");
  return access;
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const access = await accessFor(params);
    const date = isoDate(new URL(request.url).searchParams.get("date") || operationDateNow(), "date");
    return NextResponse.json(await loadPublicOperationState(access, date), { headers: { "cache-control": "no-store" } });
  } catch (error) { return jsonError(error, request); }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const access = await accessFor(params);
    const body = await readJsonObject(request);
    if (enumValue(body.entity, "entity", ["need"] as const) !== "need") throw new ApiError(400, "Only needed items can be created from this link");
    const title = requiredString(body, "title", 160);
    const note = optionalString(body, "note", 400);
    const type = enumValue(body.type || "RESTOCK", "type", ["RESTOCK", "NEW_ITEM", "ISSUE"] as const);
    const stockLevel = type === "RESTOCK" ? enumValue(body.stockLevel || "LOW", "stockLevel", ["LOW", "OUT_OF"] as const) : null;
    const [need] = await db()<Array<{ id: string }>>`
      insert into operation_needs(organization_id,title,note,reminder_type,stock_level)
      values(${access.organizationId},${title},${note},${type},${stockLevel}) returning id`;
    await db()`insert into audit_logs(organization_id,action,entity_type,entity_id,metadata) values(${access.organizationId},'PUBLIC_OPERATION_NEED_CREATED','operation_need',${need.id},'{"actor":"shared_staff_link"}'::jsonb)`;
    return NextResponse.json({ id: need.id }, { status: 201 });
  } catch (error) { return jsonError(error, request); }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const access = await accessFor(params);
    const body = await readJsonObject(request);
    const entity = enumValue(body.entity, "entity", ["dailyTask", "need"] as const);
    const id = uuid(body.id, "id");
    if (entity === "dailyTask") {
      const action = enumValue(body.action || "complete", "action", ["complete", "checklist"] as const);
      const date = isoDate(body.date || operationDateNow(), "date");
      const [task] = await db()<Array<{ id: string }>>`select id from operation_daily_tasks where id=${id} and organization_id=${access.organizationId} and active=true and assignment_scope='EVERYONE'`;
      if (!task) throw new ApiError(404, "Shared daily task not found");
      const completed = body.completed !== false;
      if (action === "checklist") {
        const itemId = requiredString(body, "itemId", 48);
        if (completed) await db()`insert into operation_task_checklist_completions(task_id,service_date,item_id,organization_id,completed_by) values(${id},${date}::date,${itemId},${access.organizationId},null) on conflict(task_id,service_date,item_id) do update set completed_by=null,completed_at=now()`;
        else await db()`delete from operation_task_checklist_completions where task_id=${id} and service_date=${date}::date and item_id=${itemId} and organization_id=${access.organizationId}`;
      } else if (completed) await db()`insert into operation_daily_task_completions(task_id,service_date,organization_id,completed_by) values(${id},${date}::date,${access.organizationId},null) on conflict(task_id,service_date) do update set completed_by=null,completed_at=now()`;
      else await db()`delete from operation_daily_task_completions where task_id=${id} and service_date=${date}::date and organization_id=${access.organizationId}`;
      await db()`insert into audit_logs(organization_id,action,entity_type,entity_id,metadata) values(${access.organizationId},${action === "checklist" ? 'PUBLIC_OPERATION_CHECKLIST_UPDATED' : 'PUBLIC_OPERATION_TASK_UPDATED'},'operation_daily_task',${id},'{"actor":"shared_staff_link"}'::jsonb)`;
      return NextResponse.json({ id, completed });
    }
    const [reminder] = await db()<Array<{ reminder_type: string }>>`select reminder_type from operation_needs where id=${id} and organization_id=${access.organizationId}`;
    if (!reminder) throw new ApiError(404, "Reminder not found");
    const status = reminder.reminder_type === "ISSUE"
      ? enumValue(body.status, "status", ["RESOLVED", "DISMISSED"] as const)
      : enumValue(body.status, "status", ["ORDERED", "DISMISSED"] as const);
    await db()`update operation_needs set status=${status},ordered_by=null,ordered_at=case when ${status}='ORDERED' then now() else null end,updated_by=null,updated_at=now() where id=${id} and organization_id=${access.organizationId}`;
    await db()`insert into audit_logs(organization_id,action,entity_type,entity_id,metadata) values(${access.organizationId},'PUBLIC_OPERATION_REMINDER_UPDATED','operation_need',${id},'{"actor":"shared_staff_link"}'::jsonb)`;
    return NextResponse.json({ id, status });
  } catch (error) { return jsonError(error, request); }
}
