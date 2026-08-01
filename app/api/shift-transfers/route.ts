import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, enumValue, jsonError, optionalString, readJsonObject, uuid } from "@/lib/http";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const rows = await db()`select t.*,s.starts_at,s.ends_at,s.role,e.first_name||' '||e.last_name target_name from shift_transfers t join shifts s on s.id=t.shift_id left join employees e on e.id=t.target_employee_id where t.organization_id=${user.organizationId} and (${user.role}<>'EMPLOYEE' or t.requested_by_employee_id=${user.employeeId} or t.target_employee_id=${user.employeeId}) order by t.created_at desc`;
    return NextResponse.json(rows);
  } catch (error) { return jsonError(error); }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !user.employeeId) return NextResponse.json({ error: "Employee profile required" }, { status: 403 });
    const body = await readJsonObject(req);
    const shiftId = uuid(body.shiftId, "shiftId");
    const type = enumValue(body.type, "type", ["HANDOVER","SWAP"] as const);
    const targetEmployeeId = body.targetEmployeeId ? uuid(body.targetEmployeeId, "targetEmployeeId") : null;
    const swapShiftId = body.swapShiftId ? uuid(body.swapShiftId, "swapShiftId") : null;
    if (type === "HANDOVER" && !targetEmployeeId) throw new ApiError(400, "A target employee is required");
    if (type === "SWAP" && (!targetEmployeeId || !swapShiftId)) throw new ApiError(400, "A target employee and swap shift are required");
    const row = await db().begin(async tx => {
      const [shift] = await tx`select * from shifts where id=${shiftId} and organization_id=${user.organizationId} and employee_id=${user.employeeId} and starts_at>now() for update`;
      if (!shift) throw new ApiError(403, "Only your future shifts can be transferred");
      const [target] = await tx`select id from employees where id=${targetEmployeeId} and organization_id=${user.organizationId} and active for share`;
      if (!target) throw new ApiError(400, "Target employee is not active in this organization");
      if (swapShiftId) {
        const [swap] = await tx`select id from shifts where id=${swapShiftId} and organization_id=${user.organizationId} and employee_id=${targetEmployeeId} and starts_at>now() for share`;
        if (!swap) throw new ApiError(400, "Swap shift is not assigned to the target employee");
      }
      const [transfer] = await tx`insert into shift_transfers(organization_id,shift_id,requested_by_employee_id,target_employee_id,swap_shift_id,type,status,note) values(${user.organizationId},${shiftId},${user.employeeId},${targetEmployeeId},${swapShiftId},${type},'PENDING_EMPLOYEE',${optionalString(body,"note",500)}) returning *`;
      await tx`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,after_data) values(${user.organizationId},${shift.location_id},${user.userId},'SHIFT_TRANSFER_REQUESTED','shift_transfer',${transfer.id},${JSON.stringify(transfer)}::jsonb)`;
      return transfer;
    });
    return NextResponse.json(row, { status: 201 });
  } catch (error) { return jsonError(error); }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await readJsonObject(req);
    const transferId = uuid(body.transferId, "transferId");
    if (user.role === "EMPLOYEE") {
      const accept = body.accept === true;
      const result = await db().begin(async tx => {
        const [transfer] = await tx`select * from shift_transfers where id=${transferId} and organization_id=${user.organizationId} for update`;
        if (!transfer || transfer.target_employee_id !== user.employeeId || transfer.status !== "PENDING_EMPLOYEE") throw new ApiError(403, "This transfer is not awaiting your response");
        const [updated] = await tx`update shift_transfers set status=${accept ? "PENDING_MANAGER" : "REJECTED"},target_responded_at=now() where id=${transfer.id} returning *`;
        return updated;
      });
      return NextResponse.json(result);
    }
    const status = enumValue(body.status, "status", ["APPROVED","REJECTED","CANCELLED"] as const);
    const result = await db().begin(async tx => {
      const [transfer] = await tx`select * from shift_transfers where id=${transferId} and organization_id=${user.organizationId} for update`;
      if (!transfer) throw new ApiError(404, "Transfer not found");
      if (transfer.status !== "PENDING_MANAGER") throw new ApiError(409, "This transfer is not ready for manager review");
      const ids = transfer.swap_shift_id ? [transfer.shift_id, transfer.swap_shift_id].sort() : [transfer.shift_id];
      const locked = ids.length === 2
        ? await tx`select * from shifts where id in (${ids[0]},${ids[1]}) and organization_id=${user.organizationId} order by id for update`
        : await tx`select * from shifts where id=${ids[0]} and organization_id=${user.organizationId} for update`;
      if (locked.length !== ids.length) throw new ApiError(409, "One of the shifts no longer exists");
      if (status === "APPROVED") {
        const original = locked.find((shift: any) => shift.id === transfer.shift_id);
        if (!original || original.employee_id !== transfer.requested_by_employee_id) throw new ApiError(409, "The original shift assignment has changed");
        if (transfer.type === "HANDOVER") {
          await tx`update shifts set employee_id=${transfer.target_employee_id},updated_at=now() where id=${transfer.shift_id}`;
        } else {
          const swap = locked.find((shift: any) => shift.id === transfer.swap_shift_id);
          if (!swap || swap.employee_id !== transfer.target_employee_id) throw new ApiError(409, "The swap shift assignment has changed");
          await tx`update shifts set employee_id=${swap.employee_id},updated_at=now() where id=${original.id}`;
          await tx`update shifts set employee_id=${original.employee_id},updated_at=now() where id=${swap.id}`;
        }
      }
      const [updated] = await tx`update shift_transfers set status=${status},reviewed_by=${user.userId},reviewed_at=now() where id=${transfer.id} returning *`;
      await tx`insert into audit_logs(organization_id,actor_user_id,action,entity_type,entity_id,after_data) values(${user.organizationId},${user.userId},'SHIFT_TRANSFER_REVIEWED','shift_transfer',${transfer.id},${JSON.stringify(updated)}::jsonb)`;
      return updated;
    });
    return NextResponse.json(result);
  } catch (error) { return jsonError(error); }
}
