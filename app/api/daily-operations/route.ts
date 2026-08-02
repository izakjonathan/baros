import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, enumValue, jsonError, optionalString, readJsonObject, requiredString, uuid } from "@/lib/http";

const roles = ["OWNER", "ADMIN", "MANAGER", "SHIFT_MANAGER"] as const;
const taskTypes = ["Opening", "Closing", "Task", "Maintenance"] as const;

function resolveLocation(value: unknown, fallback: string | null) {
  return uuid(value || fallback, "locationId");
}

export async function GET(request: Request) {
  try {
    const user = await requireUser([...roles]);
    const locationId = resolveLocation(new URL(request.url).searchParams.get("locationId"), user.locationId);
    const [location] = await db()`select id from locations where id=${locationId} and organization_id=${user.organizationId} and active`;
    if (!location) throw new ApiError(404, "Active location not found");
    const [tasks, logs] = await Promise.all([
      db()`select id,title,task_type,owner_label,due_label,done,note,created_at,updated_at from operational_tasks where organization_id=${user.organizationId} and location_id=${locationId} order by done,created_at`,
      db()`select l.id,l.title,l.body,l.created_at,coalesce(u.name,'Former manager') author from manager_log_entries l left join users u on u.id=l.author_user_id where l.organization_id=${user.organizationId} and l.location_id=${locationId} order by l.created_at desc limit 200`
    ]);
    return NextResponse.json({ tasks, logs });
  } catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser([...roles]);
    const body = await readJsonObject(request, 16_000);
    const action = enumValue(body.action, "action", ["CREATE_TASK", "CREATE_LOG"] as const);
    const locationId = resolveLocation(body.locationId, user.locationId);
    const result = await db().begin(async tx => {
      const [location] = await tx`select id from locations where id=${locationId} and organization_id=${user.organizationId} and active for share`;
      if (!location) throw new ApiError(404, "Active location not found");
      if (action === "CREATE_TASK") {
        const title = requiredString(body, "title", 240);
        const taskType = enumValue(body.taskType || "Task", "taskType", taskTypes);
        const ownerLabel = optionalString(body, "ownerLabel", 160) || "Unassigned";
        const dueLabel = optionalString(body, "dueLabel", 120) || "Today";
        const note = optionalString(body, "note", 1000);
        const [task] = await tx`insert into operational_tasks(organization_id,location_id,title,task_type,owner_label,due_label,note,created_by) values(${user.organizationId},${locationId},${title},${taskType},${ownerLabel},${dueLabel},${note},${user.userId}) returning *`;
        await tx`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,after_data) values(${user.organizationId},${locationId},${user.userId},'OPERATIONAL_TASK_CREATED','operational_task',${task.id},${JSON.stringify(task)}::jsonb)`;
        return { kind: "task", record: task };
      }
      const title = optionalString(body, "title", 160) || "Shift handover";
      const text = requiredString(body, "body", 4000);
      const [entry] = await tx`insert into manager_log_entries(organization_id,location_id,title,body,author_user_id) values(${user.organizationId},${locationId},${title},${text},${user.userId}) returning *`;
      await tx`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,after_data) values(${user.organizationId},${locationId},${user.userId},'MANAGER_LOG_CREATED','manager_log_entry',${entry.id},${JSON.stringify(entry)}::jsonb)`;
      return { kind: "log", record: { ...entry, author: user.name } };
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) { return jsonError(error); }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser([...roles]);
    const body = await readJsonObject(request, 8_000);
    const id = uuid(body.id, "id");
    const done = Boolean(body.done);
    const [task] = await db().begin(async tx => {
      const [existing] = await tx`select * from operational_tasks where id=${id} and organization_id=${user.organizationId} for update`;
      if (!existing) throw new ApiError(404, "Operational task not found");
      const [updated] = await tx`update operational_tasks set done=${done},completed_at=${done ? new Date() : null},completed_by=${done ? user.userId : null},updated_at=now() where id=${id} returning *`;
      await tx`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,before_data,after_data) values(${user.organizationId},${existing.location_id},${user.userId},'OPERATIONAL_TASK_UPDATED','operational_task',${id},${JSON.stringify(existing)}::jsonb,${JSON.stringify(updated)}::jsonb)`;
      return [updated];
    });
    return NextResponse.json(task);
  } catch (error) { return jsonError(error); }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser([...roles]);
    const body = await readJsonObject(request, 8_000);
    const id = uuid(body.id, "id");
    await db().begin(async tx => {
      const [existing] = await tx`select * from operational_tasks where id=${id} and organization_id=${user.organizationId} for update`;
      if (!existing) throw new ApiError(404, "Operational task not found");
      await tx`delete from operational_tasks where id=${id}`;
      await tx`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,before_data) values(${user.organizationId},${existing.location_id},${user.userId},'OPERATIONAL_TASK_DELETED','operational_task',${id},${JSON.stringify(existing)}::jsonb)`;
    });
    return NextResponse.json({ ok: true });
  } catch (error) { return jsonError(error); }
}
