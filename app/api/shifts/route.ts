import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, isoDate, jsonError, readJsonObject, requiredString, uuid } from "@/lib/http";
import type { SqlExecutor, SqlRow } from "@/lib/auth/scope";

type Recurrence = { frequency: "DAILY" | "WEEKLY"; count?: number; until?: string; weekdays?: number[] };
type AvailabilityRow = { available: boolean; available_from: string | null; available_to: string | null };
type ShiftRow = SqlRow & {
  id: string;
  location_id: string;
  employee_id: string | null;
  role: string;
  starts_at: string | Date;
  ends_at: string | Date;
  status: string;
  notes: string | null;
  recurrence_group_id: string | null;
  is_open: boolean;
};
type WorkspaceShiftRow = ShiftRow & { employee_name: string | null; location_timezone: string };
const management = (role?: string) => Boolean(role && role !== "EMPLOYEE");
const dateTime = (value: unknown, key: string) => {
  const text = requiredString({ [key]: value }, key, 40);
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) throw new ApiError(400, `${key} is invalid`);
  return parsed;
};

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const query = new URL(request.url).searchParams;
    const from = query.get("from") || new Date().toISOString();
    const to = query.get("to") || new Date(Date.now() + 14 * 864e5).toISOString();
    return NextResponse.json(await db()`select s.*,e.first_name||' '||e.last_name employee_name,
      (select count(*)::int from shift_claims c where c.shift_id=s.id and c.status='PENDING') pending_claims,
      case
        when s.employee_id is null then null
        when exists(select 1 from requests r where r.organization_id=s.organization_id and r.employee_id=s.employee_id and r.type='TIME_OFF' and r.status='APPROVED' and r.starts_at<s.ends_at and r.ends_at>s.starts_at) then 'APPROVED_TIME_OFF'
        when exists(
          select 1 from lateral (
            select ar.available,ar.available_from,ar.available_to from availability_rules ar
            where ar.organization_id=s.organization_id and ar.employee_id=s.employee_id
              and ((ar.valid_from=s.starts_at::date and ar.valid_until=s.starts_at::date)
                or (ar.valid_from is null and ar.valid_until is null and ar.weekday=extract(dow from s.starts_at)::int))
            order by (ar.valid_from is not null) desc limit 1
          ) availability
          where not availability.available
             or (availability.available_from is not null and s.starts_at::time < availability.available_from)
             or (availability.available_to is not null and s.ends_at::time > availability.available_to and s.ends_at::date=s.starts_at::date)
        ) then 'OUTSIDE_AVAILABILITY'
        else null
      end employee_availability_conflict
      from shifts s left join employees e on e.id=s.employee_id
      where s.organization_id=${user.organizationId} and (${user.locationId}::uuid is null or s.location_id=${user.locationId})
      and s.starts_at>=${from} and s.starts_at<${to} order by starts_at`);
  } catch (error) { return jsonError(error, request); }
}

async function assertEmployeeAvailability(tx: SqlExecutor, organizationId: string, employeeId: string, start: Date, end: Date, override = false) {
  if (override) return;
  const timeOff = await tx`select id from requests where organization_id=${organizationId} and employee_id=${employeeId} and type='TIME_OFF' and status='APPROVED' and starts_at<${end.toISOString()} and ends_at>${start.toISOString()} limit 1`;
  if (timeOff.length) throw new ApiError(409, "Employee has approved time off during this shift", { code: "APPROVED_TIME_OFF" });
  const availability = await tx<AvailabilityRow[]>`select available,available_from,available_to from availability_rules where organization_id=${organizationId} and employee_id=${employeeId} and ((valid_from=${start.toISOString().slice(0,10)}::date and valid_until=${start.toISOString().slice(0,10)}::date) or (valid_from is null and valid_until is null and weekday=${start.getUTCDay()})) order by (valid_from is not null) desc limit 1`;
  const rule = availability[0];
  if (!rule) return;
  const startTime = start.toISOString().slice(11,16);
  const endTime = end.toISOString().slice(11,16);
  const outside = !rule.available || (rule.available_from && startTime < String(rule.available_from).slice(0,5)) || (rule.available_to && start.toISOString().slice(0,10) === end.toISOString().slice(0,10) && endTime > String(rule.available_to).slice(0,5));
  if (outside) throw new ApiError(409, "Shift is outside the employee's availability", { code: "OUTSIDE_AVAILABILITY" });
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !management(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await readJsonObject(request, 24_000);
    const locationId = body.locationId ? uuid(body.locationId, "locationId") : user.locationId;
    if (!locationId) throw new ApiError(400, "A location is required");
    const isOpen = Boolean(body.isOpen);
    const employeeId = isOpen ? null : uuid(body.employeeId, "employeeId");
    const role = requiredString(body, "role", 100);
    const firstStart = dateTime(body.startsAt, "startsAt");
    const firstEnd = dateTime(body.endsAt, "endsAt");
    const duration = firstEnd.getTime() - firstStart.getTime();
    if (duration <= 0 || duration > 36 * 60 * 60 * 1000) throw new ApiError(400, "Shift duration must be between 1 minute and 36 hours");
    const recurrence = body.recurrence as Recurrence | undefined;
    const starts = expandStarts(firstStart, recurrence);

    const result = await db().begin(async (tx) => {
      const location = await tx<Array<{ id: string; timezone: string }>>`select id,timezone from locations where id=${locationId} and organization_id=${user.organizationId}`;
      if (!location.length) throw new ApiError(400, "Location does not belong to this organization");
      let employeeName: string | null = null;
      if (employeeId) {
        const employee = await tx<Array<{ id: string; employee_name: string }>>`select id, first_name||' '||last_name as employee_name from employees where id=${employeeId} and organization_id=${user.organizationId} and active`;
        if (!employee.length) throw new ApiError(400, "Employee is unavailable or belongs to another organization");
        employeeName = employee[0].employee_name;
      }
      let recurrenceId: string | null = null;
      if (recurrence) {
        const rules = await tx<Array<{ id: string }>>`insert into shift_recurrence_rules(organization_id,location_id,frequency,weekdays,starts_on,ends_on,occurrence_count,created_by)
          values(${user.organizationId},${locationId},${recurrence.frequency},${recurrence.weekdays || []},${firstStart.toISOString().slice(0,10)},${recurrence.until || null},${recurrence.count || null},${user.userId}) returning id`;
        recurrenceId = rules[0].id;
      }
      const created: WorkspaceShiftRow[] = [];
      for (const start of starts) {
        const end = new Date(start.getTime() + duration);
        if (employeeId) await assertEmployeeAvailability(tx, user.organizationId, employeeId, start, end, Boolean(body.overrideAvailability));
        const rows = await tx<ShiftRow[]>`insert into shifts(organization_id,location_id,employee_id,role,starts_at,ends_at,break_minutes,status,notes,created_by,recurrence_group_id,is_open)
          values(${user.organizationId},${locationId},${employeeId},${role},${start.toISOString()},${end.toISOString()},${Number(body.breakMinutes || 0)},${String(body.status || "DRAFT")},${body.notes ? String(body.notes).slice(0,2000) : null},${user.userId},${recurrenceId},${isOpen}) returning *`;
        created.push({ ...rows[0], employee_name: employeeName, location_timezone: location[0].timezone });
      }
      await tx`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,after_data)
        values(${user.organizationId},${locationId},${user.userId},${recurrence ? "SHIFT_SERIES_CREATED" : "SHIFT_CREATED"},'shift',${recurrenceId || created[0]?.id},${JSON.stringify({ count: created.length, shifts: created })}::jsonb)`;
      return { shifts: created, recurrenceGroupId: recurrenceId };
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) { return jsonError(error, request); }
}

function expandStarts(first: Date, recurrence?: Recurrence) {
  if (!recurrence) return [first];
  if (recurrence.frequency !== "DAILY" && recurrence.frequency !== "WEEKLY") throw new ApiError(400, "Unsupported recurrence frequency");
  const max = Math.min(Math.max(Number(recurrence.count || 1), 1), 366);
  const until = recurrence.until ? new Date(`${isoDate(recurrence.until, "until")}T23:59:59.999Z`) : null;
  const result: Date[] = [];
  if (recurrence.frequency === "DAILY") {
    for (let i = 0; i < max; i++) { const date = new Date(first); date.setUTCDate(first.getUTCDate() + i); if (until && date > until) break; result.push(date); }
    return result;
  }
  const weekdays = new Set((recurrence.weekdays?.length ? recurrence.weekdays : [first.getUTCDay()]).map(Number));
  if ([...weekdays].some(day => !Number.isInteger(day) || day < 0 || day > 6)) throw new ApiError(400, "weekdays must contain values from 0 to 6");
  for (let offset = 0; result.length < max && offset < 730; offset++) { const date = new Date(first); date.setUTCDate(first.getUTCDate() + offset); if (until && date > until) break; if (weekdays.has(date.getUTCDay())) result.push(date); }
  return result;
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !management(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await readJsonObject(request, 20_000);
    const id = uuid(body.id, "id");
    const scope = String(body.scope || "occurrence");
    if (!['occurrence','future','series'].includes(scope)) throw new ApiError(400, "scope is invalid");

    const rows = await db().begin(async (tx) => {
      const currentRows = await tx<ShiftRow[]>`select * from shifts where id=${id} and organization_id=${user.organizationId} for update`;
      const current = currentRows[0];
      if (!current) throw new ApiError(404, "Shift not found");
      const [location] = await tx<Array<{ timezone: string }>>`select timezone from locations where id=${current.location_id} and organization_id=${user.organizationId}`;
      const targetRows = scope === 'occurrence' || !current.recurrence_group_id
        ? currentRows
        : await tx<ShiftRow[]>`select * from shifts where organization_id=${user.organizationId} and recurrence_group_id=${current.recurrence_group_id} ${scope === 'future' ? tx`and starts_at>=${current.starts_at}` : tx``} order by starts_at for update`;
      const requestedStart = body.startsAt ? dateTime(body.startsAt, "startsAt") : new Date(current.starts_at);
      const requestedEnd = body.endsAt ? dateTime(body.endsAt, "endsAt") : new Date(current.ends_at);
      const newDuration = requestedEnd.getTime() - requestedStart.getTime();
      if (newDuration <= 0 || newDuration > 36 * 60 * 60 * 1000) throw new ApiError(400, "Shift duration must be between 1 minute and 36 hours");
      const dateDelta = requestedStart.getTime() - new Date(current.starts_at).getTime();
      const isOpen = body.isOpen === undefined ? current.is_open : Boolean(body.isOpen);
      const employeeId = isOpen ? null : (body.employeeId === undefined ? current.employee_id : uuid(body.employeeId, "employeeId"));
      let employeeName: string | null = null;
      if (employeeId) {
        const employee = await tx<Array<{ id: string; employee_name: string }>>`select id, first_name||' '||last_name as employee_name from employees where id=${employeeId} and organization_id=${user.organizationId} and active`;
        if (!employee.length) throw new ApiError(400, "Employee is unavailable or belongs to another organization");
        employeeName = employee[0].employee_name;
      }
      const updated: WorkspaceShiftRow[] = [];
      for (const item of targetRows) {
        const start = scope === 'occurrence' ? requestedStart : new Date(new Date(item.starts_at).getTime() + dateDelta);
        const end = new Date(start.getTime() + newDuration);
        if (employeeId) {
          const conflicts = await tx`select id from shifts where organization_id=${user.organizationId} and employee_id=${employeeId} and id<>${item.id} and status<>'CANCELLED' and starts_at<${end.toISOString()} and ends_at>${start.toISOString()} limit 1`;
          if (conflicts.length && !body.overrideConflicts) throw new ApiError(409, "Employee has scheduling conflicts", conflicts);
          await assertEmployeeAvailability(tx, user.organizationId, employeeId, start, end, Boolean(body.overrideAvailability));
        }
        const changed = await tx<ShiftRow[]>`update shifts set employee_id=${employeeId},is_open=${isOpen},role=${body.role ? String(body.role).slice(0,100) : item.role},starts_at=${start.toISOString()},ends_at=${end.toISOString()},status=${body.status ? String(body.status) : item.status},notes=${body.notes===undefined?item.notes:String(body.notes).slice(0,2000)},updated_at=now() where id=${item.id} and organization_id=${user.organizationId} returning *`;
        updated.push({ ...changed[0], employee_name: employeeName, location_timezone: location?.timezone || 'Europe/Copenhagen' });
      }
      await tx`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,before_data,after_data) values(${user.organizationId},${current.location_id},${user.userId},'SHIFT_UPDATED','shift',${id},${JSON.stringify(current)}::jsonb,${JSON.stringify({ scope, count: updated.length, changes: body })}::jsonb)`;
      return updated;
    });
    return NextResponse.json(rows);
  } catch (error) { return jsonError(error, request); }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !management(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const id = uuid(new URL(request.url).searchParams.get("id"), "id");
    const rows = await db()`delete from shifts where id=${id} and organization_id=${user.organizationId} returning *`;
    return rows.length ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) { return jsonError(error, request); }
}
