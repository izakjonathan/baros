import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { jsonError, readJsonObject, uuid } from "@/lib/http";

export async function GET() {
  const user = await requireUser(["OWNER", "ADMIN", "MANAGER", "SHIFT_MANAGER"]);
  return NextResponse.json(await db()`select a.*,e.first_name||' '||e.last_name employee_name from attendance_alerts a join employees e on e.id=a.employee_id where a.organization_id=${user.organizationId} order by (a.resolved_at is null) desc,a.created_at desc limit 250`);
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser(["OWNER", "ADMIN", "MANAGER", "SHIFT_MANAGER"]);
    const body = await readJsonObject(request, 4_000);
    const id = uuid(body.id, "id");
    const [row] = await db()`update attendance_alerts set resolved_at=now(),resolved_by=${user.userId} where id=${id} and organization_id=${user.organizationId} returning *`;
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404, headers: { "cache-control": "no-store" } });
    return NextResponse.json(row);
  } catch (error) {
    return jsonError(error, request);
  }
}
