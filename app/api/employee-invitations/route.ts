import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { jsonError, readJsonObject, requiredString, uuid } from "@/lib/http";

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
const managerRoles = ["OWNER", "ADMIN", "MANAGER"] as const;


export async function GET() {
  try {
    const user = await requireUser([...managerRoles]);
    await db()`update employee_invitations set status='EXPIRED',updated_at=now() where organization_id=${user.organizationId} and status='PENDING' and expires_at<=now()`;
    const rows = await db()`select e.id employee_id, case when e.user_id is not null then 'ACTIVE' when i.status='PENDING' and i.expires_at>now() then 'INVITED' when i.status='EXPIRED' then 'EXPIRED' else 'NONE' end portal_status, i.expires_at from employees e left join lateral (select status,expires_at from employee_invitations x where x.employee_id=e.id order by x.created_at desc limit 1) i on true where e.organization_id=${user.organizationId}`;
    return NextResponse.json(rows);
  } catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser([...managerRoles]);
    const body = await readJsonObject(request, 8_000);
    const employeeId = uuid(body.employeeId, "employeeId");
    const action = requiredString(body, "action", 20).toLowerCase();

    const [employee] = await db()<Array<{id:string;email:string|null;first_name:string;last_name:string;user_id:string|null}>>`
      select id,email,first_name,last_name,user_id from employees
      where id=${employeeId} and organization_id=${user.organizationId} limit 1`;
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    if (action === "revoke") {
      await db()`update employee_invitations set status='REVOKED',revoked_at=now(),updated_at=now()
        where employee_id=${employeeId} and organization_id=${user.organizationId} and status='PENDING'`;
      return NextResponse.json({ ok: true, status: "REVOKED" });
    }

    if (!employee.email) return NextResponse.json({ error: "Add an email address before inviting this employee" }, { status: 400 });
    if (employee.user_id) return NextResponse.json({ error: "This employee already has portal access" }, { status: 409 });
    if (action !== "invite" && action !== "resend") return NextResponse.json({ error: "Unsupported action" }, { status: 400 });

    const configuredUrl = process.env.APP_URL?.trim();
    if (process.env.NODE_ENV === "production" && !configuredUrl) throw new Error("APP_URL_REQUIRED");
    const baseUrl = (configuredUrl || new URL(request.url).origin).replace(/\/$/, "");
    if (!/^https?:\/\//i.test(baseUrl)) throw new Error("APP_URL_INVALID");
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 7 * 86400000);
    const rows = await db().transaction(async (tx) => {
      await tx`update employee_invitations set status='REVOKED',revoked_at=now(),updated_at=now()
        where employee_id=${employeeId} and organization_id=${user.organizationId} and status='PENDING'`;
      return tx`insert into employee_invitations(organization_id,employee_id,email,token_hash,expires_at,invited_by)
        values(${user.organizationId},${employeeId},${employee.email},${tokenHash(token)},${expiresAt},${user.userId}) returning id,status,expires_at`;
    });
    return NextResponse.json({
      ok: true,
      invitation: rows[0],
      activationUrl: `${baseUrl}/activate/${token}`,
      employeeName: `${employee.first_name} ${employee.last_name}`,
      email: employee.email,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "APP_URL_REQUIRED") return NextResponse.json({ error: "APP_URL must be configured before sending production invitations" }, { status: 500 });
    if (error instanceof Error && error.message === "APP_URL_INVALID") return NextResponse.json({ error: "APP_URL is invalid" }, { status: 500 });
    return jsonError(error);
  }
}
