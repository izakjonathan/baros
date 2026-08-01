import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, jsonError, readJsonObject } from "@/lib/http";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user.employeeId) return NextResponse.json({ active: null, breakActive: false, eligible: false });
    const [active] = await db()`
      select t.id,t.shift_id,t.location_id,t.work_date,t.clocked_in_at,t.clocked_out_at,t.status,t.break_minutes,
             l.name location_name,
             s.starts_at scheduled_start,s.ends_at scheduled_end,s.role scheduled_role
      from timesheets t
      join locations l on l.id=t.location_id and l.organization_id=t.organization_id
      left join shifts s on s.id=t.shift_id and s.organization_id=t.organization_id
      where t.organization_id=${user.organizationId} and t.employee_id=${user.employeeId} and t.status='OPEN'
      order by t.clocked_in_at desc limit 1
    `;
    let breakActive = false;
    if (active) {
      const [openBreak] = await db()`select id from time_breaks where timesheet_id=${active.id} and ended_at is null limit 1`;
      breakActive = Boolean(openBreak);
    }
    return NextResponse.json({ active: active || null, breakActive, eligible: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user.employeeId || !user.locationId) throw new ApiError(400, "A linked employee profile and location are required");
    const body = await readJsonObject(request);
    const action = String(body.action || "").toUpperCase();
    const sql = db();
    const [settings] = await sql`
      select * from time_clock_settings where organization_id=${user.organizationId} and location_id=${user.locationId}
    `;
    if (action === "CLOCK_IN" && settings && !settings.allow_mobile_clock) throw new ApiError(403, "Mobile clock-in is disabled for this location");

    if (action === "CLOCK_IN") {
      const existing = await sql`select id from timesheets where organization_id=${user.organizationId} and employee_id=${user.employeeId} and status='OPEN'`;
      if (existing.length) throw new ApiError(409, "Already clocked in");
      const [nextShift] = await sql`
        select id,starts_at,ends_at,role from shifts
        where organization_id=${user.organizationId} and location_id=${user.locationId}
          and employee_id=${user.employeeId} and status='PUBLISHED'
          and starts_at between now()-interval '4 hours' and now()+interval '12 hours'
        order by abs(extract(epoch from (starts_at-now()))) asc limit 1
      `;
      if (!nextShift && settings && !settings.allow_unscheduled_clock) throw new ApiError(409, "No eligible published shift is available for clock-in");
      const rows = await sql.begin(async (tx) => {
        const result = await tx`
          insert into timesheets(organization_id,location_id,employee_id,shift_id,work_date,clocked_in_at,scheduled_minutes,status)
          values(${user.organizationId},${user.locationId},${user.employeeId},${nextShift?.id || null},current_date,now(),${nextShift ? Math.max(0, Math.round((new Date(nextShift.ends_at).getTime()-new Date(nextShift.starts_at).getTime())/60000)) : 0},'OPEN')
          returning *
        `;
        await tx`
          insert into time_events(organization_id,location_id,employee_id,timesheet_id,event_type,source,created_by)
          values(${user.organizationId},${user.locationId},${user.employeeId},${result[0].id},'CLOCK_IN','MOBILE',${user.userId})
        `;
        return result;
      });
      return NextResponse.json(rows[0], { status: 201 });
    }

    const [open] = await sql`
      select * from timesheets where organization_id=${user.organizationId} and employee_id=${user.employeeId} and status='OPEN' for update
    `;
    if (!open) throw new ApiError(409, "No open timesheet");

    if (action === "BREAK_START") {
      const [already] = await sql`select id from time_breaks where timesheet_id=${open.id} and ended_at is null limit 1`;
      if (already) throw new ApiError(409, "A break is already in progress");
      await sql.begin(async (tx) => {
        await tx`insert into time_breaks(timesheet_id,started_at) values(${open.id},now())`;
        await tx`insert into time_events(organization_id,location_id,employee_id,timesheet_id,event_type,source,created_by) values(${user.organizationId},${user.locationId},${user.employeeId},${open.id},'BREAK_START','MOBILE',${user.userId})`;
      });
      return NextResponse.json({ ok: true });
    }
    if (action === "BREAK_END") {
      const rows = await sql.begin(async (tx) => {
        const ended = await tx`update time_breaks set ended_at=now() where timesheet_id=${open.id} and ended_at is null returning id`;
        if (!ended.length) throw new ApiError(409, "No break is in progress");
        await tx`insert into time_events(organization_id,location_id,employee_id,timesheet_id,event_type,source,created_by) values(${user.organizationId},${user.locationId},${user.employeeId},${open.id},'BREAK_END','MOBILE',${user.userId})`;
        return ended;
      });
      return NextResponse.json({ ok: Boolean(rows.length) });
    }
    if (action === "CLOCK_OUT") {
      await sql.begin(async (tx) => {
        await tx`update time_breaks set ended_at=now() where timesheet_id=${open.id} and ended_at is null`;
        await tx`
          update timesheets set clocked_out_at=now(),
            break_minutes=coalesce((select sum(extract(epoch from (coalesce(ended_at,now())-started_at))/60)::int from time_breaks where timesheet_id=${open.id}),0),
            worked_minutes=greatest(0,(extract(epoch from (now()-clocked_in_at))/60)::int-coalesce((select sum(extract(epoch from (coalesce(ended_at,now())-started_at))/60)::int from time_breaks where timesheet_id=${open.id}),0)),
            status='PENDING',updated_at=now() where id=${open.id}
        `;
        await tx`insert into time_events(organization_id,location_id,employee_id,timesheet_id,event_type,source,created_by) values(${user.organizationId},${user.locationId},${user.employeeId},${open.id},'CLOCK_OUT','MOBILE',${user.userId})`;
      });
      return NextResponse.json({ ok: true });
    }
    throw new ApiError(400, "Unsupported action");
  } catch (error) {
    return jsonError(error);
  }
}
