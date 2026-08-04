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
      ? await db()`select c.*,s.starts_at,s.ends_at,s.role,l.name location_name from shift_claims c join shifts s on s.id=c.shift_id join locations l on l.id=s.location_id where c.organization_id=${user.organizationId} and c.employee_id=${user.employeeId} order by c.created_at desc`
      : await db()`select c.*,s.starts_at,s.ends_at,s.role,e.first_name||' '||e.last_name employee_name from shift_claims c join shifts s on s.id=c.shift_id join employees e on e.id=c.employee_id where c.organization_id=${user.organizationId} and c.status='PENDING' and s.is_open=true and s.employee_id is null order by c.created_at asc`;
    return NextResponse.json(rows);
  } catch (error) { return jsonError(error); }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !user.employeeId) return NextResponse.json({ error: "Employee profile required" }, { status: 403 });
    const body = await readJsonObject(req);
    const shiftId = uuid(body.shiftId, "shiftId");
    const row = await db().begin(async tx => {
      const [shift] = await tx`select * from shifts where id=${shiftId} and organization_id=${user.organizationId} and is_open=true and employee_id is null for update`;
      if (!shift) throw new ApiError(409, "This shift is no longer available");
      const [claim] = await tx`insert into shift_claims(organization_id,shift_id,employee_id,note) values(${user.organizationId},${shiftId},${user.employeeId},${optionalString(body,"note",500)}) on conflict(shift_id,employee_id) do update set status='PENDING',note=excluded.note,reviewed_by=null,reviewed_at=null returning *`;
      await notifyManagers(tx, { organizationId:user.organizationId, actorUserId:user.userId, type:"SHIFT_CLAIM_CREATED", title:"Open shift request", body:"An employee requested an available shift.", href:"/?workspace=requests" });
      await tx`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,after_data) values(${user.organizationId},${shift.location_id},${user.userId},'OPEN_SHIFT_REQUESTED','shift_claim',${claim.id},${JSON.stringify(claim)}::jsonb)`;
      return claim;
    });
    return NextResponse.json(row, { status: 201 });
  } catch (error) { return jsonError(error); }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role === "EMPLOYEE") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await readJsonObject(req);
    const claimId = uuid(body.claimId, "claimId");
    const status = enumValue(body.status, "status", ["APPROVED","REJECTED","CANCELLED"] as const);
    const result = await db().begin(async tx => {
      const [claim] = await tx`select c.*,s.location_id,s.employee_id current_employee_id,s.is_open from shift_claims c join shifts s on s.id=c.shift_id where c.id=${claimId} and c.organization_id=${user.organizationId} for update of c,s`;
      if (!claim) throw new ApiError(404, "Claim not found");
      if (claim.status !== "PENDING") throw new ApiError(409, "This claim has already been reviewed");
      if (status === "APPROVED") {
        if (!claim.is_open || claim.current_employee_id) throw new ApiError(409, "This shift is no longer available");
        const updated = await tx`update shifts set employee_id=${claim.employee_id},is_open=false,status='PUBLISHED',updated_at=now() where id=${claim.shift_id} and is_open=true and employee_id is null returning id`;
        if (!updated.length) throw new ApiError(409, "Another request already assigned this shift");
        await tx`update shift_claims set status='REJECTED',reviewed_by=${user.userId},reviewed_at=now() where shift_id=${claim.shift_id} and id<>${claim.id} and status='PENDING'`;
      }
      const [reviewed] = await tx`update shift_claims set status=${status},reviewed_by=${user.userId},reviewed_at=now() where id=${claim.id} returning *`;
      await notifyEmployee(tx, { organizationId:user.organizationId, employeeId:claim.employee_id, actorUserId:user.userId, type:"SHIFT_CLAIM_REVIEWED", title:`Shift request ${status.toLowerCase()}`, body:status === "APPROVED" ? "The available shift is now assigned to you." : "Your available-shift request was not approved.", href:"/employee/shifts" });
      await tx`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,after_data) values(${user.organizationId},${claim.location_id},${user.userId},'SHIFT_CLAIM_REVIEWED','shift_claim',${claim.id},${JSON.stringify(reviewed)}::jsonb)`;
      return reviewed;
    });
    return NextResponse.json(result);
  } catch (error) { return jsonError(error); }
}
