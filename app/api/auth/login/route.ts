import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { getDevCredentials, isDevAuthEnabled } from "@/lib/auth/dev-auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const normalizedEmail = String(email).trim().toLowerCase();

  if (isDevAuthEnabled()) {
    const credentials = getDevCredentials();
    if (normalizedEmail !== credentials.email.toLowerCase() || String(password) !== credentials.password) {
      return NextResponse.json({ error: "Invalid development email or password" }, { status: 401 });
    }
    await createSession("dev-user", "dev-organization", "dev-location");
    return NextResponse.json({ ok: true, redirect: "/", mode: "development" });
  }

  const rows = await db()<Array<{id:string;password_hash:string;organization_id:string;location_id:string|null;role:string}>>`
    select u.id,u.password_hash,m.organization_id,(select el.location_id from employees e join employee_locations el on el.employee_id=e.id where e.user_id=u.id and e.organization_id=m.organization_id order by el.primary_location desc limit 1) location_id,m.role
    from users u join memberships m on m.user_id=u.id where u.email=${normalizedEmail} and u.status='ACTIVE' order by case m.role when 'OWNER' then 1 when 'ADMIN' then 2 else 3 end limit 1`;
  const user=rows[0];
  if(!user || !(await verifyPassword(String(password),user.password_hash))) return NextResponse.json({error:"Invalid email or password"},{status:401});
  await createSession(user.id,user.organization_id,user.location_id);
  return NextResponse.json({ok:true,redirect:user.role==='EMPLOYEE'?'/employee':'/'});
}
