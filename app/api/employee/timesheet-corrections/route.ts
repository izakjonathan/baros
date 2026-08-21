import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, jsonError, readJsonObject, requiredString, uuid } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user.employeeId) throw new ApiError(403, "A linked employee profile is required");
    const body = await readJsonObject(request);
    const timesheetId = uuid(body.timesheetId, "timesheetId");
    const reason = requiredString(body, "reason", 1000);
    const rows = await db().begin(async (sql) => {
      const [sheet] = await sql`
        select id,location_id,status from timesheets
        where id=${timesheetId} and organization_id=${user.organizationId} and employee_id=${user.employeeId}
        for update
      `;
      if (!sheet) throw new ApiError(404, "Timesheet not found");
      if (sheet.status === "OPEN") throw new ApiError(409, "Clock out before requesting a correction");
      const existing = await sql`
        select id from timesheet_correction_requests
        where timesheet_id=${timesheetId} and employee_id=${user.employeeId} and status='PENDING'
      `;
      if (existing.length) throw new ApiError(409, "A correction request is already pending");
      const result = await sql`
        insert into timesheet_correction_requests(organization_id,timesheet_id,employee_id,reason)
        values(${user.organizationId},${timesheetId},${user.employeeId},${reason}) returning *
      `;
      await sql`
        insert into notifications(organization_id,user_id,type,title,body,href)
        select ${user.organizationId},m.user_id,'TIMESHEET_CORRECTION','Timesheet correction requested',${reason},'/manager?section=attendance'
        from memberships m where m.organization_id=${user.organizationId} and m.role in ('OWNER','ADMIN','MANAGER','SHIFT_MANAGER')
      `;
      return result;
    });
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    return jsonError(error, request);
  }
}
