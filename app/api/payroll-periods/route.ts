import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { requireOrganizationLocation } from "@/lib/auth/scope";
import { db } from "@/lib/db/client";
import { ApiError, isoDate, jsonError, readJsonObject, uuid } from "@/lib/http";

export async function GET() {
  const user = await requireUser(["OWNER", "ADMIN", "MANAGER", "SHIFT_MANAGER"]);
  return NextResponse.json(await db()`select p.*,coalesce((select count(*) from payroll_exports x where x.payroll_period_id=p.id),0)::int export_count from payroll_periods p where p.organization_id=${user.organizationId} order by starts_on desc`);
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(["OWNER", "ADMIN", "MANAGER"]);
    const body = await readJsonObject(request, 8_000);
    const action = String(body.action || "");
    const row = await db().begin(async (tx) => {
      let rows: any[];
      if (action === "CREATE") {
        const locationId = body.locationId ? uuid(body.locationId, "locationId") : user.locationId;
        await requireOrganizationLocation(tx as any, user.organizationId, locationId, { lock: true });
        const from = isoDate(body.from, "from");
        const to = isoDate(body.to, "to");
        if (to < from) throw new ApiError(400, "Payroll period end must not be before its start");
        rows = await tx`insert into payroll_periods(organization_id,location_id,starts_on,ends_on) values(${user.organizationId},${locationId},${from},${to}) on conflict(organization_id,location_id,starts_on,ends_on) do update set starts_on=excluded.starts_on returning *`;
      } else {
        const id = uuid(body.id, "id");
        if (action === "LOCK") rows = await tx`update payroll_periods set status='LOCKED',locked_by=${user.userId},locked_at=now() where id=${id} and organization_id=${user.organizationId} and status='OPEN' returning *`;
        else if (action === "UNLOCK") rows = await tx`update payroll_periods set status='OPEN',locked_by=null,locked_at=null where id=${id} and organization_id=${user.organizationId} and status='LOCKED' returning *`;
        else if (action === "CLOSE") rows = await tx`update payroll_periods set status='CLOSED',closed_by=${user.userId},closed_at=now() where id=${id} and organization_id=${user.organizationId} and status in ('LOCKED','EXPORTED') returning *`;
        else throw new ApiError(400, "Unknown payroll action");
      }
      if (!rows.length) throw new ApiError(409, "Invalid payroll transition or record not found");
      const result = rows[0];
      await tx`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,after_data) values(${user.organizationId},${result.location_id},${user.userId},${`PAYROLL_${action}`},'payroll_period',${result.id},${JSON.stringify(result)}::jsonb)`;
      return result;
    });
    return NextResponse.json(row);
  } catch (error) { return jsonError(error); }
}
