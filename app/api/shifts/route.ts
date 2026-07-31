import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { writeAudit } from "@/lib/services/audit";

type Recurrence = { frequency: "DAILY" | "WEEKLY"; count?: number; until?: string; weekdays?: number[] };

export async function GET(req: Request) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const q = new URL(req.url).searchParams;
  const from = q.get("from") || new Date().toISOString();
  const to = q.get("to") || new Date(Date.now() + 14 * 864e5).toISOString();
  const rows = await db()`select s.*,e.first_name||' '||e.last_name employee_name,
    (select count(*)::int from shift_claims c where c.shift_id=s.id and c.status='PENDING') pending_claims
    from shifts s left join employees e on e.id=s.employee_id
    where s.organization_id=${u.organizationId} and (${u.locationId}::uuid is null or s.location_id=${u.locationId})
    and s.starts_at>=${from} and s.starts_at<${to} order by starts_at`;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const u = await getSessionUser();
  if (!u || u.role === "EMPLOYEE") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await req.json();
  const locationId = b.locationId || u.locationId;
  if (!locationId) return NextResponse.json({ error: "A location is required" }, { status: 400 });
  if (!b.isOpen && !b.employeeId) return NextResponse.json({ error: "Choose an employee or make the shift available" }, { status: 400 });

  const starts = expandStarts(new Date(b.startsAt), b.recurrence as Recurrence | undefined);
  const duration = new Date(b.endsAt).getTime() - new Date(b.startsAt).getTime();
  if (!(duration > 0)) return NextResponse.json({ error: "Shift end must be after start" }, { status: 400 });

  let recurrenceId: string | null = null;
  if (b.recurrence) {
    const r = b.recurrence as Recurrence;
    const [rule] = await db()`insert into shift_recurrence_rules(organization_id,location_id,frequency,weekdays,starts_on,ends_on,occurrence_count,created_by)
      values(${u.organizationId},${locationId},${r.frequency},${r.weekdays || []},${b.startsAt.slice(0,10)},${r.until || null},${r.count || null},${u.userId}) returning id`;
    recurrenceId = rule.id;
  }

  const created = [];
  for (const start of starts) {
    const end = new Date(start.getTime() + duration);
    const [row] = await db()`insert into shifts(organization_id,location_id,employee_id,role,starts_at,ends_at,break_minutes,status,notes,created_by,recurrence_group_id,is_open)
      values(${u.organizationId},${locationId},${b.isOpen ? null : b.employeeId},${b.role},${start.toISOString()},${end.toISOString()},${b.breakMinutes || 0},${b.status || "DRAFT"},${b.notes || null},${u.userId},${recurrenceId},${Boolean(b.isOpen)}) returning *`;
    created.push(row);
  }
  await writeAudit({ organizationId: u.organizationId, locationId, actorUserId: u.userId, action: b.recurrence ? "SHIFT_SERIES_CREATED" : "SHIFT_CREATED", entityType: "shift", entityId: recurrenceId || created[0]?.id, after: { count: created.length, shifts: created } });
  return NextResponse.json({ shifts: created, recurrenceGroupId: recurrenceId }, { status: 201 });
}

function expandStarts(first: Date, recurrence?: Recurrence) {
  if (!recurrence) return [first];
  const max = Math.min(Math.max(recurrence.count || 1, 1), 366);
  const until = recurrence.until ? new Date(`${recurrence.until}T23:59:59.999Z`) : null;
  const result: Date[] = [];
  if (recurrence.frequency === "DAILY") {
    for (let i = 0; i < max; i++) {
      const date = new Date(first); date.setUTCDate(first.getUTCDate() + i);
      if (until && date > until) break; result.push(date);
    }
    return result;
  }
  const weekdays = new Set((recurrence.weekdays?.length ? recurrence.weekdays : [first.getUTCDay()]));
  for (let offset = 0; result.length < max && offset < 730; offset++) {
    const date = new Date(first); date.setUTCDate(first.getUTCDate() + offset);
    if (until && date > until) break;
    if (weekdays.has(date.getUTCDay())) result.push(date);
  }
  return result;
}
