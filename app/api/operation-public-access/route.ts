import { NextResponse } from "next/server";
import { ownerCanManageOperation } from "@/features/operation/content";
import { getSessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, enumValue, isoDate, jsonError, readJsonObject } from "@/lib/http";

async function requireOwner() {
  const user = await getSessionUser();
  if (!user) throw new ApiError(401, "Authentication required");
  if (!ownerCanManageOperation(user.role)) throw new ApiError(403, "Owner or Admin permission is required");
  return user;
}

function publicAccessPayload(row: Record<string, unknown>) {
  const token = String(row.access_token);
  return {
    enabled: Boolean(row.enabled),
    expiresAt: row.expires_at == null ? null : String(row.expires_at),
    rotatedAt: row.rotated_at == null ? null : String(row.rotated_at),
    url: `/operation/public/${token}`,
  };
}

export async function GET(request: Request) {
  try {
    const user = await requireOwner();
    const [row] = await db()<Array<Record<string, unknown>>>`
      select access_token,enabled,expires_at,rotated_at from operation_public_access where organization_id=${user.organizationId}`;
    if (!row) throw new ApiError(404, "Shared staff link is unavailable");
    return NextResponse.json(publicAccessPayload(row), { headers: { "cache-control": "no-store" } });
  } catch (error) { return jsonError(error, request); }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireOwner();
    const body = await readJsonObject(request);
    const action = enumValue(body.action, "action", ["rotate", "enable", "disable", "expiry"] as const);
    const expiresAt = action === "expiry" && body.expiresAt ? isoDate(body.expiresAt, "expiresAt") : null;
    const [row] = await db()<Array<Record<string, unknown>>>`
      update operation_public_access set
        access_token=case when ${action}='rotate' then gen_random_uuid() else access_token end,
        enabled=case when ${action}='enable' then true when ${action}='disable' then false else enabled end,
        expires_at=case when ${action}='expiry' then ${expiresAt}::date + interval '1 day' else expires_at end,
        rotated_at=case when ${action}='rotate' then now() else rotated_at end,
        updated_at=now()
      where organization_id=${user.organizationId}
      returning access_token,enabled,expires_at,rotated_at`;
    if (!row) throw new ApiError(404, "Shared staff link is unavailable");
    await db()`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,metadata)
      values(${user.organizationId},${user.locationId},${user.userId},'OPERATION_PUBLIC_LINK_UPDATED','operation_public_access',${user.organizationId},${JSON.stringify({ action })}::jsonb)`;
    return NextResponse.json(publicAccessPayload(row));
  } catch (error) { return jsonError(error, request); }
}
