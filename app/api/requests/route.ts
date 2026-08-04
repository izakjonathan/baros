import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, enumValue, jsonError, optionalString, readJsonObject, uuid } from "@/lib/http";
import { notifyEmployee, notifyManagers } from "@/lib/services/notifications";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const rows = user.role === "EMPLOYEE"
      ? await db()`select * from requests where organization_id=${user.organizationId} and employee_id=${user.employeeId} order by created_at desc`
      : await db()`select r.*,e.first_name||' '||e.last_name employee_name,l.name location_name from requests r join employees e on e.id=r.employee_id left join locations l on l.id=r.location_id where r.organization_id=${user.organizationId} and r.status='PENDING' order by r.created_at asc`;
    return NextResponse.json(rows);
  } catch (error) { return jsonError(error); }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !user.employeeId) return NextResponse.json({ error: "Employee profile required" }, { status: 403 });
    const body = await readJsonObject(req);
    const type = enumValue(body.type, "type", ["TIME_OFF", "AVAILABILITY"] as const);
    const startsAt = optionalString(body, "startsAt", 64);
    const endsAt = optionalString(body, "endsAt", 64);
    if (!startsAt || !endsAt) throw new ApiError(400, "A start and end are required");
    const start = new Date(startsAt); const end = new Date(endsAt);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) throw new ApiError(400, "The request dates are invalid");
    const row = await db().begin(async tx => {
      const [created] = await tx`insert into requests(organization_id,location_id,employee_id,type,starts_at,ends_at,note) values(${user.organizationId},${user.locationId},${user.employeeId},${type},${start.toISOString()},${end.toISOString()},${optionalString(body,"note",1000)}) returning *`;
      await notifyManagers(tx, { organizationId:user.organizationId, actorUserId:user.userId, type:"REQUEST_CREATED", title:type === "TIME_OFF" ? "New time-off request" : "New availability request", body:"An employee request is waiting for review.", href:"/?workspace=requests" });
      await tx`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,after_data) values(${user.organizationId},${user.locationId},${user.userId},'REQUEST_CREATED','request',${created.id},${JSON.stringify(created)}::jsonb)`;
      return created;
    });
    return NextResponse.json(row, { status: 201 });
  } catch (error) { return jsonError(error); }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role === "EMPLOYEE") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await readJsonObject(req);
    const requestId = uuid(body.requestId, "requestId");
    const status = enumValue(body.status, "status", ["APPROVED", "REJECTED", "CANCELLED"] as const);
    const reviewed = await db().begin(async tx => {
      const [request] = await tx`select * from requests where id=${requestId} and organization_id=${user.organizationId} for update`;
      if (!request) throw new ApiError(404, "Request not found");
      if (request.status !== "PENDING") throw new ApiError(409, "This request has already been reviewed");
      const [updated] = await tx`update requests set status=${status},reviewed_by=${user.userId},reviewed_at=now() where id=${requestId} returning *`;
      await notifyEmployee(tx, { organizationId:user.organizationId, employeeId:request.employee_id, actorUserId:user.userId, type:"REQUEST_REVIEWED", title:`Request ${status.toLowerCase()}`, body:request.type === "TIME_OFF" ? "Your time-off request has been reviewed." : "Your availability request has been reviewed.", href:"/employee/requests" });
      await tx`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,before_data,after_data) values(${user.organizationId},${request.location_id},${user.userId},'REQUEST_REVIEWED','request',${request.id},${JSON.stringify(request)}::jsonb,${JSON.stringify(updated)}::jsonb)`;
      return updated;
    });
    return NextResponse.json(reviewed);
  } catch (error) { return jsonError(error); }
}
