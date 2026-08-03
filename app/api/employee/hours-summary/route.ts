import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, jsonError } from "@/lib/http";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    if (!user.employeeId) throw new ApiError(403, "A linked employee profile is required");
    const url = new URL(request.url);
    const from = url.searchParams.get("from") || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const to = url.searchParams.get("to") || new Date().toISOString().slice(0, 10);
    const [summary] = await db()`
      select
        coalesce((select sum(extract(epoch from (s.ends_at-s.starts_at))/60)::int)
          from shifts s
          where s.organization_id=${user.organizationId} and s.employee_id=${user.employeeId}
            and s.status='PUBLISHED' and s.starts_at::date between ${from}::date and ${to}::date),0) scheduled_minutes,
        coalesce((select sum(t.worked_minutes)
          from timesheets t
          where t.organization_id=${user.organizationId} and t.employee_id=${user.employeeId}
            and t.status='APPROVED' and t.work_date between ${from}::date and ${to}::date),0) approved_minutes
    `;
    const timesheets = await db()`
      select t.id,t.work_date,t.clocked_in_at,t.clocked_out_at,t.scheduled_minutes,t.worked_minutes,t.break_minutes,t.status,t.employee_note,t.manager_note,
             exists(select 1 from timesheet_correction_requests r where r.timesheet_id=t.id and r.status='PENDING') correction_pending
      from timesheets t
      where t.organization_id=${user.organizationId} and t.employee_id=${user.employeeId}
        and t.work_date between ${from}::date and ${to}::date
      order by t.work_date desc,t.clocked_in_at desc
    `;
    return NextResponse.json({ summary, timesheets });
  } catch (error) {
    return jsonError(error);
  }
}
