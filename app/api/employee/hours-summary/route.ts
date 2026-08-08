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
    const [scheduled] = await db()<Array<{ scheduled_minutes: number }>>`
      select coalesce(sum((date_part('epoch', s.ends_at - s.starts_at) / 60)::int), 0)::int scheduled_minutes
      from shifts s
      where s.organization_id=${user.organizationId} and s.employee_id=${user.employeeId}
        and s.status='PUBLISHED' and s.starts_at::date between ${from}::date and ${to}::date
    `;
    const [approved] = await db()<Array<{ approved_minutes: number }>>`
      select coalesce(sum(greatest(0, (date_part('epoch', t.clocked_out_at - t.clocked_in_at) / 60)::int - coalesce(t.break_minutes,0))), 0)::int approved_minutes
      from timesheets t
      where t.organization_id=${user.organizationId} and t.employee_id=${user.employeeId}
        and t.status='APPROVED' and t.clocked_out_at is not null and t.work_date between ${from}::date and ${to}::date
    `;
    const summary = {
      scheduled_minutes: Number(scheduled?.scheduled_minutes || 0),
      approved_minutes: Number(approved?.approved_minutes || 0),
    };
    const timesheets = await db()<Array<{
      id: string;
      work_date: string | Date;
      clocked_in_at: string | Date;
      clocked_out_at: string | Date | null;
      scheduled_minutes: number;
      worked_minutes: number;
      break_minutes: number;
      status: string;
      employee_note: string | null;
      manager_note: string | null;
    }>>`
      select t.id,t.work_date,t.clocked_in_at,t.clocked_out_at,t.scheduled_minutes,
        case when t.clocked_out_at is not null then greatest(0, (date_part('epoch', t.clocked_out_at - t.clocked_in_at) / 60)::int - coalesce(t.break_minutes,0)) else coalesce(t.worked_minutes,0) end::int worked_minutes,
        t.break_minutes,t.status,t.employee_note,t.manager_note
      from timesheets t
      where t.organization_id=${user.organizationId} and t.employee_id=${user.employeeId}
        and t.work_date between ${from}::date and ${to}::date
      order by t.work_date desc,t.clocked_in_at desc
    `;

    let pendingCorrectionIds = new Set<string>();
    try {
      const corrections = await db()<Array<{ timesheet_id: string }>>`
        select r.timesheet_id
        from timesheet_correction_requests r
        join timesheets t on t.id=r.timesheet_id and t.organization_id=${user.organizationId}
        where t.employee_id=${user.employeeId} and r.status='PENDING'
      `;
      pendingCorrectionIds = new Set(corrections.map((item) => item.timesheet_id));
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
      if (code !== "42P01") throw error;
    }

    return NextResponse.json({
      summary,
      timesheets: timesheets.map((item) => ({
        ...item,
        correction_pending: pendingCorrectionIds.has(item.id),
      })),
    });
  } catch (error) {
    return jsonError(error);
  }
}
