import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { jsonError, readJsonObject, requiredString } from "@/lib/http";

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
const sessionTokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
const cookieName = () => process.env.SESSION_COOKIE_NAME || "bar_ops_session";

type InvitationRow = {
  id: string;
  organization_id: string;
  employee_id: string;
  email: string;
  first_name: string;
  last_name: string;
  location_id: string | null;
};

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request, 10_000);
    const token = requiredString(body, "token", 200);
    const password = requiredString(body, "password", 256);
    if (password.length < 12) {
      return NextResponse.json({ error: "Password must be at least 12 characters" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    await enforceRateLimit(`activate:${ip}:${tokenHash(token).slice(0, 16)}`, 8, 15 * 60);

    const rawSessionToken = randomBytes(32).toString("base64url");
    const days = Number(process.env.SESSION_TTL_DAYS || 30);
    const expiresAt = new Date(Date.now() + days * 86_400_000);

    const result = await db().begin(async (tx) => {
      const invitations = await tx<InvitationRow[]>`
        select
          i.id,
          i.organization_id,
          i.employee_id,
          i.email,
          e.first_name,
          e.last_name,
          (
            select el.location_id
            from employee_locations el
            join locations l on l.id = el.location_id
            where el.employee_id = e.id
              and l.organization_id = i.organization_id
              and l.active = true
            order by el.primary_location desc, l.created_at asc
            limit 1
          ) as location_id
        from employee_invitations i
        join employees e
          on e.id = i.employee_id
         and e.organization_id = i.organization_id
        where i.token_hash = ${tokenHash(token)}
          and i.status = 'PENDING'
          and i.expires_at > now()
        for update of i, e
      `;

      const invitation = invitations[0];
      if (!invitation) throw new Error("INVITATION_INVALID");

      const existing = await tx<Array<{ id: string; password_hash: string }>>`
        select id, password_hash
        from users
        where email = ${invitation.email}
        limit 1
        for update
      `;

      let userId = existing[0]?.id;
      if (userId) {
        if (!(await verifyPassword(password, existing[0].password_hash))) {
          throw new Error("EXISTING_PASSWORD_INVALID");
        }
        const memberships = await tx<Array<{ role: string }>>`
          select role
          from memberships
          where user_id = ${userId}
            and organization_id = ${invitation.organization_id}
          for update
        `;
        if (memberships[0] && memberships[0].role !== "EMPLOYEE") {
          throw new Error("ACCOUNT_CONFLICT");
        }
        await tx`update users set status = 'ACTIVE', updated_at = now() where id = ${userId}`;
      } else {
        const passwordHash = await hashPassword(password);
        const created = await tx<Array<{ id: string }>>`
          insert into users(email, name, password_hash, status)
          values(
            ${invitation.email},
            ${`${invitation.first_name} ${invitation.last_name}`},
            ${passwordHash},
            'ACTIVE'
          )
          returning id
        `;
        userId = created[0]?.id;
        if (!userId) throw new Error("USER_CREATE_FAILED");
      }

      await tx`
        insert into memberships(organization_id, user_id, role)
        values(${invitation.organization_id}, ${userId}, 'EMPLOYEE')
        on conflict(organization_id, user_id)
        do update set role = 'EMPLOYEE'
      `;

      const linkedEmployees = await tx<Array<{ id: string }>>`
        update employees
        set user_id = ${userId}, updated_at = now()
        where id = ${invitation.employee_id}
          and organization_id = ${invitation.organization_id}
        returning id
      `;
      if (!linkedEmployees[0]) throw new Error("EMPLOYEE_LINK_FAILED");

      const accepted = await tx<Array<{ id: string }>>`
        update employee_invitations
        set status = 'ACCEPTED',
            accepted_by = ${userId},
            accepted_at = now(),
            updated_at = now()
        where id = ${invitation.id}
          and status = 'PENDING'
        returning id
      `;
      if (!accepted[0]) throw new Error("INVITATION_ALREADY_USED");

      await tx`
        update employee_invitations
        set status = 'REVOKED', revoked_at = now(), updated_at = now()
        where employee_id = ${invitation.employee_id}
          and id <> ${invitation.id}
          and status = 'PENDING'
      `;

      const auditPayload = JSON.stringify({ email: invitation.email, portalAccess: "ACTIVE" });
      await tx`
        insert into audit_logs(
          organization_id,
          location_id,
          actor_user_id,
          action,
          entity_type,
          entity_id,
          after_data
        ) values(
          ${invitation.organization_id},
          ${invitation.location_id},
          ${userId},
          'EMPLOYEE_PORTAL_ACTIVATED',
          'employee',
          ${invitation.employee_id},
          ${auditPayload}::jsonb
        )
      `;

      await tx`
        delete from sessions
        where user_id = ${userId}
          and organization_id = ${invitation.organization_id}
          and expires_at <= now()
      `;
      await tx`
        insert into sessions(user_id, organization_id, location_id, token_hash, expires_at)
        values(
          ${userId},
          ${invitation.organization_id},
          ${invitation.location_id},
          ${sessionTokenHash(rawSessionToken)},
          ${expiresAt}
        )
      `;

      return { userId, organizationId: invitation.organization_id };
    });

    const store = await cookies();
    store.set(cookieName(), rawSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return NextResponse.json({ ok: true, redirect: "/employee", userId: result.userId });
  } catch (error) {
    if (error instanceof Error && ["INVITATION_INVALID", "INVITATION_ALREADY_USED"].includes(error.message)) {
      return NextResponse.json({ error: "This invitation is invalid, expired, or already used" }, { status: 410 });
    }
    if (error instanceof Error && error.message === "EXISTING_PASSWORD_INVALID") {
      return NextResponse.json(
        { error: "This email already has a Bar Ops account. Enter its existing password to accept the invitation." },
        { status: 401 },
      );
    }
    if (error instanceof Error && error.message === "ACCOUNT_CONFLICT") {
      return NextResponse.json({ error: "This email is already used by a management account" }, { status: 409 });
    }
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }
    if (error instanceof Error && ["USER_CREATE_FAILED", "EMPLOYEE_LINK_FAILED"].includes(error.message)) {
      return NextResponse.json({ error: "The employee account could not be linked. Ask a manager to resend the invitation." }, { status: 409 });
    }
    return jsonError(error);
  }
}
