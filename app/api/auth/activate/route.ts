import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { jsonError, readJsonObject, requiredString } from "@/lib/http";

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request, 10_000);
    const token = requiredString(body, "token", 200);
    const password = requiredString(body, "password", 256);
    if (password.length < 12) return NextResponse.json({ error: "Password must be at least 12 characters" }, { status: 400 });
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    await enforceRateLimit(`activate:${ip}:${tokenHash(token).slice(0,16)}`, 8, 15 * 60);

    const result = await db().transaction(async (tx) => {
      const invitations = await tx<Array<{id:string;organization_id:string;employee_id:string;email:string;first_name:string;last_name:string;location_id:string|null}>>`
        select i.id,i.organization_id,i.employee_id,i.email,e.first_name,e.last_name,
          (select el.location_id from employee_locations el where el.employee_id=e.id order by el.primary_location desc limit 1) location_id
        from employee_invitations i join employees e on e.id=i.employee_id
        where i.token_hash=${tokenHash(token)} and i.status='PENDING' and i.expires_at>now()
        for update of i`;
      const invitation = invitations[0];
      if (!invitation) throw new Error("INVITATION_INVALID");
      const existing = await tx<Array<{id:string;password_hash:string;status:string}>>`select id,password_hash,status from users where email=${invitation.email} limit 1`;
      let userId = existing[0]?.id;
      if (userId) {
        if (!(await verifyPassword(password, existing[0].password_hash))) throw new Error("EXISTING_PASSWORD_INVALID");
        const memberships = await tx<Array<{role:string}>>`select role from memberships where user_id=${userId} and organization_id=${invitation.organization_id}`;
        if (memberships[0] && memberships[0].role !== 'EMPLOYEE') throw new Error("ACCOUNT_CONFLICT");
        await tx`update users set status='ACTIVE',updated_at=now() where id=${userId}`;
      } else {
        const passwordHash = await hashPassword(password);
        const created = await tx<Array<{id:string}>>`insert into users(email,name,password_hash,status)
          values(${invitation.email},${`${invitation.first_name} ${invitation.last_name}`},${passwordHash},'ACTIVE') returning id`;
        userId = created[0].id;
      }
      await tx`insert into memberships(organization_id,user_id,role) values(${invitation.organization_id},${userId},'EMPLOYEE')
        on conflict(organization_id,user_id) do update set role='EMPLOYEE'`;
      await tx`update employees set user_id=${userId},updated_at=now() where id=${invitation.employee_id} and organization_id=${invitation.organization_id}`;
      await tx`update employee_invitations set status='ACCEPTED',accepted_by=${userId},accepted_at=now(),updated_at=now() where id=${invitation.id}`;
      await tx`update employee_invitations set status='REVOKED',revoked_at=now(),updated_at=now()
        where employee_id=${invitation.employee_id} and id<>${invitation.id} and status='PENDING'`;
      await tx`insert into audit_logs(organization_id,actor_user_id,action,entity_type,entity_id,after_data)
        values(${invitation.organization_id},${userId},'EMPLOYEE_PORTAL_ACTIVATED','employee',${invitation.employee_id},jsonb_build_object('email',${invitation.email}))`;
      return { userId, organizationId: invitation.organization_id, locationId: invitation.location_id };
    });
    await createSession(result.userId, result.organizationId, result.locationId);
    return NextResponse.json({ ok: true, redirect: "/employee" });
  } catch (error) {
    if (error instanceof Error && error.message === "INVITATION_INVALID") return NextResponse.json({ error: "This invitation is invalid, expired, or already used" }, { status: 410 });
    if (error instanceof Error && error.message === "EXISTING_PASSWORD_INVALID") return NextResponse.json({ error: "This email already has a Bar Ops account. Enter its existing password to accept the invitation." }, { status: 401 });
    if (error instanceof Error && error.message === "ACCOUNT_CONFLICT") return NextResponse.json({ error: "This email is already used by a management account" }, { status: 409 });
    if (error instanceof Error && error.message === "RATE_LIMITED") return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    return jsonError(error);
  }
}
