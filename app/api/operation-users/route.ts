import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, enumValue, jsonError, optionalString, readJsonObject, requiredString, uuid } from "@/lib/http";

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
const invitationRoles = ["OWNER", "MANAGER", "EMPLOYEE"] as const;

async function requireOwner() {
  const user = await getSessionUser();
  if (!user) throw new ApiError(401, "Authentication required");
  if (user.role !== "OWNER" && user.role !== "ADMIN") throw new ApiError(403, "Owner permission is required");
  return user;
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function GET(request: Request) {
  try {
    const owner = await requireOwner();
    await db()`
      update operation_user_invitations
      set status='EXPIRED', updated_at=now()
      where organization_id=${owner.organizationId}
        and status='PENDING'
        and expires_at<=now()`;

    const [users, invitations, locations] = await Promise.all([
      db()<Array<Record<string, unknown>>>`
        select u.id,u.name,u.email,u.status,m.role,m.created_at,
               employee.id employee_id,
               primary_location.location_id,
               primary_location.location_name
        from memberships m
        join users u on u.id=m.user_id
        left join lateral (
          select e.id from employees e
          where e.organization_id=m.organization_id and e.user_id=u.id
          order by e.created_at asc limit 1
        ) employee on true
        left join lateral (
          select l.id location_id,l.name location_name
          from employee_locations el
          join locations l on l.id=el.location_id and l.organization_id=m.organization_id
          where el.employee_id=employee.id
          order by el.primary_location desc,l.created_at asc limit 1
        ) primary_location on true
        where m.organization_id=${owner.organizationId}
        order by case m.role when 'OWNER' then 1 when 'ADMIN' then 2 when 'MANAGER' then 3 else 4 end,u.name`,
      db()<Array<Record<string, unknown>>>`
        select id,name,email,role,status,location_id,expires_at,created_at
        from operation_user_invitations
        where organization_id=${owner.organizationId} and status in ('PENDING','EXPIRED')
        order by created_at desc limit 50`,
      db()<Array<Record<string, unknown>>>`
        select id,name from locations
        where organization_id=${owner.organizationId} and active=true
        order by name`,
    ]);

    return NextResponse.json({ users, invitations, locations }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "42P01") {
      return jsonError(new ApiError(503, "User invitations are not ready. Run database migration 025_operation_user_invitations.sql."), request);
    }
    return jsonError(error, request);
  }
}

export async function POST(request: Request) {
  try {
    const owner = await requireOwner();
    const body = await readJsonObject(request, 8_000);
    const name = requiredString(body, "name", 120);
    const email = requiredString(body, "email", 320).toLowerCase();
    const role = enumValue(body.role, "role", invitationRoles);
    const locationId = optionalString(body, "locationId", 36);
    if (!validEmail(email)) throw new ApiError(400, "Enter a valid email address");

    let normalizedLocationId: string | null = null;
    if (locationId) {
      normalizedLocationId = uuid(locationId, "locationId");
      const [location] = await db()<Array<{ id: string }>>`
        select id from locations
        where id=${normalizedLocationId} and organization_id=${owner.organizationId} and active=true
        limit 1`;
      if (!location) throw new ApiError(400, "Location is unavailable");
    }

    const [existingMembership] = await db()<Array<{ id: string }>>`
      select m.id from memberships m
      join users u on u.id=m.user_id
      where m.organization_id=${owner.organizationId} and lower(u.email)=lower(${email})
      limit 1`;
    if (existingMembership) throw new ApiError(409, "This email already has access to Operation");

    const configuredUrl = process.env.APP_URL?.trim();
    if (process.env.NODE_ENV === "production" && !configuredUrl) throw new Error("APP_URL_REQUIRED");
    const baseUrl = (configuredUrl || new URL(request.url).origin).replace(/\/$/, "");
    if (!/^https?:\/\//i.test(baseUrl)) throw new Error("APP_URL_INVALID");

    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 7 * 86_400_000);
    const [invitation] = await db().begin(async tx => {
      await tx`
        update operation_user_invitations
        set status='REVOKED', revoked_at=now(), updated_at=now()
        where organization_id=${owner.organizationId}
          and lower(email)=lower(${email})
          and status='PENDING'`;
      const created = await tx<Array<Record<string, unknown>>>`
        insert into operation_user_invitations(
          organization_id,location_id,email,name,role,token_hash,expires_at,invited_by
        ) values(
          ${owner.organizationId},${normalizedLocationId},${email},${name},${role},${tokenHash(token)},${expiresAt},${owner.userId}
        ) returning id,name,email,role,status,location_id,expires_at,created_at`;
      await tx`
        insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,after_data)
        values(
          ${owner.organizationId},${normalizedLocationId},${owner.userId},'OPERATION_USER_INVITED',
          'operation_user_invitation',${String(created[0]?.id || "")},
          ${JSON.stringify({ name, email, role })}::jsonb
        )`;
      return created;
    });

    return NextResponse.json({
      invitation,
      activationUrl: `${baseUrl}/activate/${token}`,
    }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message === "APP_URL_REQUIRED") return NextResponse.json({ error: "APP_URL must be configured before creating production invitations" }, { status: 500 });
    if (error instanceof Error && error.message === "APP_URL_INVALID") return NextResponse.json({ error: "APP_URL is invalid" }, { status: 500 });
    return jsonError(error, request);
  }
}

export async function PATCH(request: Request) {
  try {
    const owner = await requireOwner();
    const body = await readJsonObject(request, 4_000);
    const invitationId = uuid(body.invitationId, "invitationId");
    const action = enumValue(body.action, "action", ["revoke"] as const);
    const rows = await db()<Array<{ id: string }>>`
      update operation_user_invitations
      set status='REVOKED', revoked_at=now(), updated_at=now()
      where id=${invitationId} and organization_id=${owner.organizationId} and status='PENDING'
      returning id`;
    if (!rows[0]) throw new ApiError(404, "Pending invitation not found");
    await db()`
      insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,metadata)
      values(${owner.organizationId},${owner.locationId},${owner.userId},'OPERATION_USER_INVITATION_REVOKED','operation_user_invitation',${invitationId},${JSON.stringify({ action })}::jsonb)`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error, request);
  }
}
