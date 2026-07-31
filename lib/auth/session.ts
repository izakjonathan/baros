import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";

export type AppRole = "OWNER" | "ADMIN" | "MANAGER" | "SHIFT_MANAGER" | "EMPLOYEE";
export type SessionUser = { userId: string; email: string; name: string; role: AppRole; organizationId: string; locationId: string | null; employeeId: string | null };
const cookieName = () => process.env.SESSION_COOKIE_NAME || "bar_ops_session";
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string, organizationId: string, locationId: string | null) {
  const token = randomBytes(32).toString("base64url");
  const days = Number(process.env.SESSION_TTL_DAYS || 30);
  const expiresAt = new Date(Date.now() + days * 86400000);
  await db()`insert into sessions (user_id, organization_id, location_id, token_hash, expires_at) values (${userId}, ${organizationId}, ${locationId}, ${tokenHash(token)}, ${expiresAt})`;
  const store = await cookies();
  store.set(cookieName(), token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt });
}
export async function destroySession() {
  const store = await cookies();
  const token = store.get(cookieName())?.value;
  if (token) await db()`delete from sessions where token_hash = ${tokenHash(token)}`;
  store.delete(cookieName());
}
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(cookieName())?.value;
  if (!token) return null;
  const rows = await db()<SessionUser[]>`
    select u.id as "userId", u.email, u.name, m.role, s.organization_id as "organizationId",
           s.location_id as "locationId", e.id as "employeeId"
    from sessions s
    join users u on u.id = s.user_id
    join memberships m on m.user_id = u.id and m.organization_id = s.organization_id
    left join employees e on e.user_id = u.id and e.organization_id = s.organization_id
    where s.token_hash = ${tokenHash(token)} and s.expires_at > now() and u.status = 'ACTIVE'
    limit 1`;
  return rows[0] || null;
}
export async function requireUser(roles?: AppRole[]) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/employee");
  return user;
}
