import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { getDevCredentials, isDevAuthEnabled } from "@/lib/auth/dev-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { jsonError, readJsonObject, requiredString } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request, 8_000);
    const email = requiredString(body, "email", 320).toLowerCase();
    const password = requiredString(body, "password", 256);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!isDevAuthEnabled()) await enforceRateLimit(`login:${ip}:${email}`, 8, 15 * 60);
    if (isDevAuthEnabled()) {
      const credentials = getDevCredentials();
      if (email !== credentials.email.toLowerCase() || password !== credentials.password) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      await createSession("dev-user", "dev-organization", "dev-location");
      return NextResponse.json({ ok: true, redirect: "/", mode: "development" });
    }
    const rows = await db()<Array<{id:string;password_hash:string;organization_id:string;location_id:string|null;role:string}>>`
      select u.id,u.password_hash,m.organization_id,(select el.location_id from employees e join employee_locations el on el.employee_id=e.id where e.user_id=u.id and e.organization_id=m.organization_id order by el.primary_location desc limit 1) location_id,m.role
      from users u join memberships m on m.user_id=u.id where u.email=${email} and u.status='ACTIVE' order by case m.role when 'OWNER' then 1 when 'ADMIN' then 2 else 3 end limit 1`;
    const user=rows[0];
    if(!user || !(await verifyPassword(password,user.password_hash))) return NextResponse.json({error:"Invalid email or password"},{status:401});
    await createSession(user.id,user.organization_id,user.location_id);
    return NextResponse.json({ok:true,redirect:user.role==='EMPLOYEE'?'/employee':'/'});
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });
    return jsonError(error);
  }
}
