import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";

function csv(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export async function GET(req: Request) {
  const user = await requireUser(["OWNER", "ADMIN", "MANAGER", "SHIFT_MANAGER"]);
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const locationId = url.searchParams.get("locationId");
  if (!from || !to) return Response.json({ error: "from and to are required" }, { status: 400 });

  const rows = await db()<Array<{employee_id:string;employee_name:string;email:string|null;phone:string|null;role:string;approved_timesheets:number;approved_minutes:number}>>`
    select e.id employee_id,
           e.first_name || ' ' || e.last_name employee_name,
           e.email,
           e.phone,
           coalesce(e.employment_title, 'Employee') role,
           count(t.id)::int approved_timesheets,
           coalesce(sum(t.worked_minutes), 0)::int approved_minutes
      from employees e
      join timesheets t on t.employee_id = e.id
     where e.organization_id = ${user.organizationId}
       and t.organization_id = ${user.organizationId}
       and t.status = 'APPROVED'
       and t.work_date between ${from}::date and ${to}::date
       and (${locationId}::uuid is null or t.location_id = ${locationId}::uuid)
     group by e.id, e.first_name, e.last_name, e.email, e.phone, e.employment_title
     order by e.first_name, e.last_name`;

  const header = ["Employee ID","Employee","Email","Phone","Role","Period start","Period end","Approved timesheets","Approved hours"];
  const body = rows.map(row => [row.employee_id,row.employee_name,row.email,row.phone,row.role,from,to,row.approved_timesheets,(row.approved_minutes/60).toFixed(2)]);
  const content = [header, ...body].map(row => row.map(csv).join(",")).join("\r\n");
  return new Response("\ufeff" + content, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="approved-hours-${from}-to-${to}.csv"`, "cache-control": "no-store" } });
}
