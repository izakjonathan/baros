import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { jsonError, readJsonObject, requiredString } from "@/lib/http";
import { sessionCookieName, sessionCookieOptions, sessionExpiry } from "@/lib/auth/session-cookie";
import { persistSessionRecord } from "@/lib/auth/session-store";
import { requestIdFrom } from "@/lib/observability";

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

type InvitationRow = {
  id: string;
  organization_id: string;
  location_id: string | null;
  email: string;
  name: string;
  role: "OWNER" | "MANAGER" | "EMPLOYEE";
};

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  return { firstName: parts.shift() || name, lastName: parts.join(" ") || "User" };
}

export async function POST(request: Request) {
  const requestId = requestIdFrom(request);
  const responseHeaders = { "cache-control": "no-store", "x-request-id": requestId };
  try {
    const body = await readJsonObject(request, 10_000);
    const token = requiredString(body, "token", 200);
    const password = requiredString(body, "password", 256);
    if (password.length < 12) {
      return NextResponse.json({ error: "Password must be at least 12 characters", requestId }, { status: 400, headers: responseHeaders });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    await enforceRateLimit(`activate:${ip}:${tokenHash(token).slice(0, 16)}`, 8, 15 * 60);
    const rawSessionToken = randomBytes(32).toString("base64url");
    const expiresAt = sessionExpiry();

    const result = await db().begin(async tx => {
      const invitations = await tx<InvitationRow[]>`
        select id,organization_id,location_id,email,name,role
        from operation_user_invitations
        where token_hash=${tokenHash(token)} and status='PENDING' and expires_at>now()
        for update`;
      const invitation = invitations[0];
      if (!invitation) throw new Error("INVITATION_INVALID");

      const existing = await tx<Array<{ id: string; password_hash: string }>>`
        select id,password_hash from users where email=${invitation.email} limit 1 for update`;
      let userId = existing[0]?.id;
      if (userId) {
        if (!(await verifyPassword(password, existing[0].password_hash))) throw new Error("EXISTING_PASSWORD_INVALID");
        await tx`update users set status='ACTIVE',name=${invitation.name},updated_at=now() where id=${userId}`;
      } else {
        const passwordHash = await hashPassword(password);
        const created = await tx<Array<{ id: string }>>`
          insert into users(email,name,password_hash,status)
          values(${invitation.email},${invitation.name},${passwordHash},'ACTIVE') returning id`;
        userId = created[0]?.id;
        if (!userId) throw new Error("USER_CREATE_FAILED");
      }

      await tx`
        insert into memberships(organization_id,user_id,role)
        values(${invitation.organization_id},${userId},${invitation.role})
        on conflict(organization_id,user_id) do update set role=excluded.role`;

      let employeeId: string | null = null;
      if (invitation.role !== "OWNER") {
        const { firstName, lastName } = splitName(invitation.name);
        const existingEmployees = await tx<Array<{ id: string }>>`
          select id from employees
          where organization_id=${invitation.organization_id} and lower(email)=lower(${invitation.email})
          order by created_at asc limit 1 for update`;
        employeeId = existingEmployees[0]?.id || null;
        if (employeeId) {
          await tx`
            update employees set user_id=${userId},first_name=${firstName},last_name=${lastName},active=true,updated_at=now()
            where id=${employeeId} and organization_id=${invitation.organization_id}`;
        } else {
          const createdEmployees = await tx<Array<{ id: string }>>`
            insert into employees(organization_id,user_id,first_name,last_name,email,employment_title,active)
            values(${invitation.organization_id},${userId},${firstName},${lastName},${invitation.email},${invitation.role === "MANAGER" ? "Manager" : "Employee"},true)
            returning id`;
          employeeId = createdEmployees[0]?.id || null;
        }
        if (!employeeId) throw new Error("EMPLOYEE_LINK_FAILED");
        if (invitation.location_id) {
          await tx`
            insert into employee_locations(employee_id,location_id,primary_location)
            values(${employeeId},${invitation.location_id},true)
            on conflict(employee_id,location_id) do update set primary_location=true`;
          await tx`
            update employee_locations set primary_location=false
            where employee_id=${employeeId} and location_id<>${invitation.location_id}`;
        }
      }

      const accepted = await tx<Array<{ id: string }>>`
        update operation_user_invitations
        set status='ACCEPTED',accepted_by=${userId},accepted_at=now(),updated_at=now()
        where id=${invitation.id} and status='PENDING' returning id`;
      if (!accepted[0]) throw new Error("INVITATION_ALREADY_USED");
      await tx`
        update operation_user_invitations
        set status='REVOKED',revoked_at=now(),updated_at=now()
        where organization_id=${invitation.organization_id} and lower(email)=lower(${invitation.email})
          and id<>${invitation.id} and status='PENDING'`;
      await tx`
        insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,after_data)
        values(${invitation.organization_id},${invitation.location_id},${userId},'OPERATION_USER_ACTIVATED','user',${userId},${JSON.stringify({ email: invitation.email, role: invitation.role, employeeId })}::jsonb)`;
      await persistSessionRecord(tx, { userId, organizationId: invitation.organization_id, locationId: invitation.location_id, rawToken: rawSessionToken, expiresAt });
      return { userId };
    });

    const store = await cookies();
    store.set(sessionCookieName(), rawSessionToken, sessionCookieOptions(expiresAt));
    return NextResponse.json({ ok: true, redirect: "/operation", userId: result.userId, requestId }, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof Error && ["INVITATION_INVALID", "INVITATION_ALREADY_USED"].includes(error.message)) {
      return NextResponse.json({ error: "This invitation is invalid, expired, or already used", requestId }, { status: 410, headers: responseHeaders });
    }
    if (error instanceof Error && error.message === "EXISTING_PASSWORD_INVALID") {
      return NextResponse.json({ error: "This email already has an account. Enter its existing password to accept the invitation.", requestId }, { status: 401, headers: responseHeaders });
    }
    if (error instanceof Error && ["USER_CREATE_FAILED", "EMPLOYEE_LINK_FAILED"].includes(error.message)) {
      return NextResponse.json({ error: "The account could not be created. Ask the owner to create a new invitation.", requestId }, { status: 409, headers: responseHeaders });
    }
    return jsonError(error, request);
  }
}
