import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, jsonError, readJsonObject } from "@/lib/http";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user.employeeId || !user.locationId) {
      return NextResponse.json({
        active: null,
        breakActive: false,
        eligible: false,
        eligibilityError: !user.employeeId
          ? "A linked employee profile is required"
          : "An assigned active location is required",
      });
    }
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
    const [settings] = await db()`select coalesce(s.require_location_check,false) require_location_check,l.timezone from locations l left join time_clock_settings s on s.location_id=l.id and s.organization_id=l.organization_id where l.id=${user.locationId} and l.organization_id=${user.organizationId} limit 1`;
    return NextResponse.json({ active: active || null, breakActive, eligible: true, requireLocationCheck:Boolean(settings?.require_location_check), timezone:settings?.timezone || 'Europe/Copenhagen' });
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
    const latitude = typeof body.latitude === 'number' ? body.latitude : null;
    const longitude = typeof body.longitude === 'number' ? body.longitude : null;
    const accuracy = typeof body.accuracy === 'number' ? body.accuracy : null;
    if (!['CLOCK_IN','BREAK_START','BREAK_END','CLOCK_OUT'].includes(action)) throw new ApiError(400, "Unsupported action");

    const result = await db().begin(async (tx) => {
      const [location] = await tx`
        select l.id,l.timezone,
          coalesce(s.allow_mobile_clock,true) allow_mobile_clock,
          coalesce(s.allow_unscheduled_clock,false) allow_unscheduled_clock,
          coalesce(s.require_location_check,false) require_location_check,
          coalesce(s.early_clock_in_minutes,15) early_clock_in_minutes,
          l.latitude,l.longitude,l.clock_radius_meters
        from locations l
        left join time_clock_settings s on s.location_id=l.id and s.organization_id=l.organization_id
        where l.id=${user.locationId} and l.organization_id=${user.organizationId} and l.active=true
        for update of l
      `;
      if (!location) throw new ApiError(400, "The assigned location is unavailable");

      if (action === 'CLOCK_IN') {
        if (!location.allow_mobile_clock) throw new ApiError(403, "Mobile clock-in is disabled for this location");
        if (location.require_location_check) {
          if (latitude === null || longitude === null) throw new ApiError(400, "Location access is required to clock in");
          if (location.latitude === null || location.longitude === null) throw new ApiError(409, "This location has not been configured for location-based clock-in");
          const distance = 6371000 * 2 * Math.asin(Math.sqrt(
            Math.sin((Number(latitude)-Number(location.latitude))*Math.PI/360) ** 2 +
            Math.cos(Number(location.latitude)*Math.PI/180) * Math.cos(Number(latitude)*Math.PI/180) *
            Math.sin((Number(longitude)-Number(location.longitude))*Math.PI/360) ** 2
          ));
          if (distance > Number(location.clock_radius_meters || 150) + Math.max(0, Number(accuracy || 0))) throw new ApiError(403, "You are outside the permitted clock-in area");
        }
        const existing = await tx`select id from timesheets where organization_id=${user.organizationId} and employee_id=${user.employeeId} and status='OPEN' for update`;
        if (existing.length) throw new ApiError(409, "Already clocked in");
        const [nextShift] = await tx`
          select id,starts_at,ends_at,role from shifts
          where organization_id=${user.organizationId} and location_id=${user.locationId}
            and employee_id=${user.employeeId} and status='PUBLISHED'
            and starts_at between now()-interval '4 hours' and now()+(${location.early_clock_in_minutes}::int * interval '1 minute')
          order by abs(extract(epoch from (starts_at-now()))) asc limit 1
          for update
        `;
        if (!nextShift && !location.allow_unscheduled_clock) throw new ApiError(409, "No eligible published shift is available for clock-in");
        const [timesheet] = await tx`
          insert into timesheets(organization_id,location_id,employee_id,shift_id,work_date,clocked_in_at,scheduled_minutes,status)
          values(
            ${user.organizationId},${user.locationId},${user.employeeId},${nextShift?.id || null},
            (now() at time zone ${location.timezone})::date,now(),
            ${nextShift ? Math.max(0, Math.round((new Date(nextShift.ends_at).getTime()-new Date(nextShift.starts_at).getTime())/60000)) : 0},'OPEN'
          ) returning *
        `;
        await tx`insert into time_events(organization_id,location_id,employee_id,timesheet_id,event_type,source,latitude,longitude,accuracy_meters,created_by) values(${user.organizationId},${user.locationId},${user.employeeId},${timesheet.id},'CLOCK_IN','MOBILE',${latitude},${longitude},${accuracy},${user.userId})`;
        return { status: 201, body: timesheet };
      }

      const [open] = await tx`select * from timesheets where organization_id=${user.organizationId} and employee_id=${user.employeeId} and status='OPEN' for update`;
      if (!open) throw new ApiError(409, "No open timesheet");

      if (action === 'BREAK_START') {
        const openBreak = await tx`select id from time_breaks where timesheet_id=${open.id} and ended_at is null for update`;
        if (openBreak.length) throw new ApiError(409, "A break is already in progress");
        await tx`insert into time_breaks(timesheet_id,started_at) values(${open.id},now())`;
        await tx`insert into time_events(organization_id,location_id,employee_id,timesheet_id,event_type,source,created_by) values(${user.organizationId},${user.locationId},${user.employeeId},${open.id},'BREAK_START','MOBILE',${user.userId})`;
        return { status: 200, body: { ok: true } };
      }
      if (action === 'BREAK_END') {
        const ended = await tx`update time_breaks set ended_at=now() where timesheet_id=${open.id} and ended_at is null returning id`;
        if (!ended.length) throw new ApiError(409, "No break is in progress");
        await tx`insert into time_events(organization_id,location_id,employee_id,timesheet_id,event_type,source,created_by) values(${user.organizationId},${user.locationId},${user.employeeId},${open.id},'BREAK_END','MOBILE',${user.userId})`;
        return { status: 200, body: { ok: true } };
      }

      await tx`update time_breaks set ended_at=now() where timesheet_id=${open.id} and ended_at is null`;
      const [closed] = await tx`
        update timesheets set clocked_out_at=now(),
          break_minutes=coalesce((select sum(extract(epoch from (ended_at-started_at))/60)::int from time_breaks where timesheet_id=${open.id}),0),
          worked_minutes=greatest(0,(extract(epoch from (now()-clocked_in_at))/60)::int-coalesce((select sum(extract(epoch from (ended_at-started_at))/60)::int from time_breaks where timesheet_id=${open.id}),0)),
          status='PENDING',updated_at=now() where id=${open.id} returning *
      `;
      await tx`insert into time_events(organization_id,location_id,employee_id,timesheet_id,event_type,source,created_by) values(${user.organizationId},${user.locationId},${user.employeeId},${open.id},'CLOCK_OUT','MOBILE',${user.userId})`;
      return { status: 200, body: closed };
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return jsonError(error);
  }
}
