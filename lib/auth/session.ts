import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { createDevSessionToken, getDevSessionUser, isDevAuthEnabled, verifyDevSessionToken } from "@/lib/auth/dev-auth";
import { expiredSessionCookieOptions, sessionCookieName, sessionCookieOptions, sessionExpiry } from "@/lib/auth/session-cookie";

export type AppRole = "OWNER" | "ADMIN" | "MANAGER" | "SHIFT_MANAGER" | "EMPLOYEE";
export type SessionUser = { userId: string; email: string; name: string; role: AppRole; organizationId: string; locationId: string | null; employeeId: string | null };
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string, organizationId: string, locationId: string | null, devRole: AppRole = "OWNER") {
  const store = await cookies();
  const expiresAt = sessionExpiry();

  if (isDevAuthEnabled() && userId === "dev-user") {
    store.set(sessionCookieName(), createDevSessionToken(devRole), sessionCookieOptions(expiresAt));
    return;
  }

  const token = randomBytes(32).toString("base64url");
  await db()`insert into sessions (user_id, organization_id, location_id, token_hash, expires_at) values (${userId}, ${organizationId}, ${locationId}, ${tokenHash(token)}, ${expiresAt})`;
  store.set(sessionCookieName(), token, sessionCookieOptions(expiresAt));
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(sessionCookieName())?.value;
  if (token && !isDevAuthEnabled()) {
    await db()`delete from sessions where token_hash = ${tokenHash(token)}`;
  }
  store.set(sessionCookieName(), "", expiredSessionCookieOptions());
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(sessionCookieName())?.value;
  if (isDevAuthEnabled()) {
    if (!token) return null;
    const devUser = verifyDevSessionToken(token);
    if (!devUser) return null;

    const [context] = devUser.role === "EMPLOYEE"
      ? await db()<Array<{ userId: string; email: string; name: string; organizationId: string; locationId: string | null; employeeId: string }>>`
          select u.id as "userId",u.email,u.name,e.organization_id as "organizationId",
                 primary_location.location_id as "locationId",
                 e.id as "employeeId"
          from employees e
          join users u on u.id=e.user_id and u.status='ACTIVE'
          join memberships m on m.user_id=u.id and m.organization_id=e.organization_id and m.role='EMPLOYEE'
          left join lateral (
            select el.location_id
            from employee_locations el
            join locations l on l.id=el.location_id and l.organization_id=e.organization_id and l.active=true
            where el.employee_id=e.id
            order by el.primary_location desc,el.location_id
            limit 1
          ) primary_location on true
          where e.active=true and primary_location.location_id is not null
          order by e.id
          limit 1`
      : await db()<Array<{ userId: string; email: string; name: string; organizationId: string; locationId: string | null; employeeId: null }>>`
          select u.id as "userId",u.email,u.name,m.organization_id as "organizationId",
                 location.id as "locationId",null::uuid as "employeeId"
          from memberships m
          join users u on u.id=m.user_id and u.status='ACTIVE'
          left join lateral (
            select l.id from locations l
            where l.organization_id=m.organization_id and l.active=true
            order by l.id limit 1
          ) location on true
          where m.role in ('OWNER','ADMIN','MANAGER','SHIFT_MANAGER')
          order by case m.role when 'OWNER' then 1 when 'ADMIN' then 2 when 'MANAGER' then 3 else 4 end,u.id
          limit 1`;

    return context ? { ...context, role: devUser.role } : { ...devUser, locationId: null };
  }

  if (!token) return null;

  const rows = await db()<SessionUser[]>`
    select u.id as "userId",u.email,u.name,m.role,s.organization_id as "organizationId",
           coalesce(valid_session_location.id,employee_location.location_id) as "locationId",
           employee.id as "employeeId"
    from sessions s
    join users u on u.id=s.user_id
    join memberships m on m.user_id=u.id and m.organization_id=s.organization_id
    left join lateral (
      select e.id
      from employees e
      where e.user_id=u.id and e.organization_id=s.organization_id and e.active=true
      order by e.id
      limit 1
    ) employee on true
    left join locations valid_session_location
      on valid_session_location.id=s.location_id
     and valid_session_location.organization_id=s.organization_id
     and valid_session_location.active=true
    left join lateral (
      select el.location_id
      from employee_locations el
      join locations l on l.id=el.location_id and l.organization_id=s.organization_id and l.active=true
      where el.employee_id=employee.id
      order by el.primary_location desc,el.location_id
      limit 1
    ) employee_location on true
    where s.token_hash=${tokenHash(token)} and s.expires_at>now() and u.status='ACTIVE'
    limit 1`;
  return rows[0] || null;
}

export async function requireUser(roles?: AppRole[]) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/employee");
  return user;
}
