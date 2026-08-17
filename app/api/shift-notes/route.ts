import { NextResponse } from "next/server";
import { hasCapability } from "@/lib/auth/capabilities";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, jsonError, readJsonObject, uuid } from "@/lib/http";

const categories = new Set(['NOTE','INCIDENT','EQUIPMENT','STOCK']);

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await readJsonObject(request);
    const shiftId = uuid(String(body.shiftId || ''), 'shiftId');
    const note = String(body.note || '').trim();
    const category = String(body.category || 'NOTE').toUpperCase();
    if (!note || note.length > 2000) throw new ApiError(400, 'Note must be between 1 and 2000 characters');
    if (!categories.has(category)) throw new ApiError(400, 'Unsupported note category');

    const [shift] = await db()`select id,location_id,employee_id from shifts where id=${shiftId} and organization_id=${user.organizationId} limit 1`;
    if (!shift) throw new ApiError(404, 'Shift not found');
    const canManage = hasCapability(user.role, "schedule.edit");
    const canWriteOwn = hasCapability(user.role, "employee.self_service") && user.employeeId && shift.employee_id === user.employeeId;
    if (!canManage && !canWriteOwn) throw new ApiError(403, 'You can only add notes to your own shifts');

    const [created] = await db()`insert into shift_notes(organization_id,location_id,shift_id,employee_id,author_user_id,note,category) values(${user.organizationId},${shift.location_id},${shiftId},${user.employeeId || shift.employee_id || null},${user.userId},${note},${category}) returning id,note,category,created_at`;
    return NextResponse.json(created, { status: 201 });
  } catch (error) { return jsonError(error); }
}
