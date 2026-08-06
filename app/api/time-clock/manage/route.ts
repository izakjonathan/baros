import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, jsonError, readJsonObject, uuid } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const user = await requireCapability("attendance.manage");
    const body = await readJsonObject(request);
    const timesheetId = uuid(String(body.timesheetId || ""), "timesheetId");
    const action = String(body.action || "").toUpperCase();
    if (!['BREAK_START', 'BREAK_END'].includes(action)) throw new ApiError(400, "Unsupported action");

    const result = await db().begin(async (tx) => {
      const [sheet] = await tx`
        select t.id,t.employee_id,t.location_id,t.status
        from timesheets t
        where t.id=${timesheetId} and t.organization_id=${user.organizationId}
        for update
      `;
      if (!sheet || sheet.status !== 'OPEN') throw new ApiError(409, "This employee is no longer clocked in");

      if (action === 'BREAK_START') {
        const openBreak = await tx`select id from time_breaks where timesheet_id=${timesheetId} and ended_at is null for update`;
        if (openBreak.length) throw new ApiError(409, "A break is already in progress");
        const [created] = await tx`insert into time_breaks(timesheet_id,started_at) values(${timesheetId},now()) returning id,started_at`;
        await tx`insert into time_events(organization_id,location_id,employee_id,timesheet_id,event_type,source,created_by) values(${user.organizationId},${sheet.location_id},${sheet.employee_id},${timesheetId},'BREAK_START','MANAGER',${user.userId})`;
        return { onBreak: true, breakStartedAt: created.started_at };
      }

      const [ended] = await tx`update time_breaks set ended_at=now() where timesheet_id=${timesheetId} and ended_at is null returning id,started_at,ended_at`;
      if (!ended) throw new ApiError(409, "No break is in progress");
      await tx`insert into time_events(organization_id,location_id,employee_id,timesheet_id,event_type,source,created_by) values(${user.organizationId},${sheet.location_id},${sheet.employee_id},${timesheetId},'BREAK_END','MANAGER',${user.userId})`;
      return { onBreak: false, breakStartedAt: null };
    });
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
