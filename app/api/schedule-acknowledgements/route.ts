import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, isoDate, jsonError, readJsonObject, uuid } from "@/lib/http";

type AcknowledgementRow = {
  publication_id: string;
  version: number;
  published_at: string;
  employee_id: string;
  employee_name: string;
  acknowledged_at: string | null;
  change_types: string[] | null;
};

export async function GET(request: Request) {
  try {
    const user = await requireUser(["OWNER", "ADMIN", "MANAGER", "SHIFT_MANAGER"]);
    const url = new URL(request.url);
    const locationId = uuid(url.searchParams.get("locationId") || user.locationId, "locationId");
    const weekStart = isoDate(url.searchParams.get("weekStart"), "weekStart");
    const rows = await db()<AcknowledgementRow[]>`
      with latest_publication as (
        select id, version, published_at
        from schedule_publications
        where organization_id=${user.organizationId}
          and location_id=${locationId}
          and week_start=${weekStart}::date
        order by version desc
        limit 1
      ), relevant_employees as (
        select distinct e.id employee_id, e.first_name || ' ' || e.last_name employee_name
        from latest_publication p
        join shifts s on s.organization_id=${user.organizationId} and s.location_id=${locationId} and s.starts_at>=${weekStart}::date and s.starts_at<${weekStart}::date + interval '7 days' and s.status in ('PUBLISHED','CONFIRMED') and s.employee_id is not null
        join employees e on e.id=s.employee_id and e.organization_id=s.organization_id
        union
        select e.id, e.first_name || ' ' || e.last_name
        from latest_publication p
        join schedule_publication_changes c on c.publication_id=p.id
        join employees e on e.id=c.employee_id and e.organization_id=${user.organizationId}
      )
      select p.id publication_id,p.version,p.published_at,a.employee_id,a.employee_name,sa.acknowledged_at,c.change_types
      from latest_publication p
      cross join relevant_employees a
      left join schedule_acknowledgements sa on sa.publication_id=p.id and sa.employee_id=a.employee_id
      left join schedule_publication_changes c on c.publication_id=p.id and c.employee_id=a.employee_id
      order by a.employee_name
    `;
    return NextResponse.json({
      publication: rows.length ? { id: rows[0].publication_id, version: rows[0].version, publishedAt: rows[0].published_at } : null,
      employees: rows.map((row) => ({ id: row.employee_id, name: row.employee_name, acknowledgedAt: row.acknowledged_at, changeTypes: row.change_types || [] })),
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user.employeeId) throw new ApiError(400, "A linked employee profile is required");
    const body = await readJsonObject(request);
    const publicationId = uuid(body.publicationId, "publicationId");
    const result = await db().begin(async (sql) => {
      const publications = await sql<Array<{ id: string; location_id: string; week_start: string }>>`
        select id,location_id,week_start
        from schedule_publications
        where id=${publicationId} and organization_id=${user.organizationId}
        for update
      `;
      const publication = publications[0];
      if (!publication) throw new ApiError(404, "Schedule publication not found");
      const eligibility = await sql<Array<{ eligible: boolean }>>`
        select exists(
          select 1 from shifts
          where organization_id=${user.organizationId}
            and location_id=${publication.location_id}
            and employee_id=${user.employeeId}
            and starts_at>=${publication.week_start}::date
            and starts_at<${publication.week_start}::date + interval '7 days'
            and status in ('PUBLISHED','CONFIRMED')
          union all
          select 1 from schedule_publication_changes where publication_id=${publicationId} and employee_id=${user.employeeId}
        ) eligible
      `;
      if (!eligibility[0]?.eligible) throw new ApiError(403, "This schedule update does not affect you");
      const rows = await sql<Array<{ acknowledged_at: string }>>`
        insert into schedule_acknowledgements(publication_id,employee_id)
        values(${publicationId},${user.employeeId})
        on conflict(publication_id,employee_id) do update set acknowledged_at=excluded.acknowledged_at
        returning acknowledged_at
      `;
      await sql`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,after_data) values(${user.organizationId},${publication.location_id},${user.userId},'SCHEDULE_ACKNOWLEDGED','schedule_publication',${publicationId},${JSON.stringify({employeeId:user.employeeId})}::jsonb)`;
      return rows[0];
    });
    return NextResponse.json({ ok: true, acknowledgedAt: result.acknowledged_at });
  } catch (error) {
    return jsonError(error);
  }
}
