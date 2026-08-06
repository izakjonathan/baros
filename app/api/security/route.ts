import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser, requireCapability } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { ApiError, enumValue, jsonError, readJsonObject, requiredString, uuid } from "@/lib/http";

const SECURITY_ACTIONS = ["PASSWORD_RESET_REQUEST", "GDPR_REQUEST", "REVOKE_SESSION"] as const;
const GDPR_REQUEST_TYPES = ["ACCESS", "EXPORT", "ERASURE", "RECTIFICATION"] as const;

export async function GET() {
  const user = await requireCapability("security.manage");
  const [sessions, mfa, gdpr, health] = await Promise.all([
    db()`select s.id,s.created_at,s.expires_at,s.location_id from sessions s where s.organization_id=${user.organizationId} and s.user_id=${user.userId} order by s.created_at desc`,
    db()`select id,factor_type,enabled_at,last_used_at,created_at from mfa_factors where user_id=${user.userId}`,
    db()`select * from gdpr_requests where organization_id=${user.organizationId} order by requested_at desc limit 100`,
    db()`select * from system_health_events where organization_id=${user.organizationId} or organization_id is null order by created_at desc limit 100`,
  ]);
  return NextResponse.json({ sessions, mfa, gdpr, health, backupGuidance: "Use managed PostgreSQL point-in-time recovery and scheduled logical exports; verify restore quarterly." });
}

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request, 8_000);
    const action = enumValue(body.action, "action", SECURITY_ACTIONS);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    await enforceRateLimit(`security:${ip}`, 8, 60);

    if (action === "PASSWORD_RESET_REQUEST") {
      const email = requiredString(body, "email", 320).toLowerCase();
      const [user] = await db()`select id from users where lower(email)=${email} and status='ACTIVE'`;
      if (user) {
        const token = randomBytes(32).toString("base64url");
        await db()`insert into password_reset_tokens(user_id,token_hash,expires_at) values(${user.id},${createHash("sha256").update(token).digest("hex")},now()+interval '30 minutes')`;
        return NextResponse.json({ ok: true, developmentToken: process.env.NODE_ENV === "production" ? undefined : token });
      }
      return NextResponse.json({ ok: true });
    }

    const user = await getSessionUser();
    if (!user) throw new ApiError(401, "Unauthorized");
    if (action === "GDPR_REQUEST") {
      const requestType = enumValue(body.requestType, "requestType", GDPR_REQUEST_TYPES);
      const [row] = await db()`insert into gdpr_requests(organization_id,user_id,employee_id,request_type) values(${user.organizationId},${user.userId},${user.employeeId},${requestType}) returning *`;
      return NextResponse.json(row, { status: 201 });
    }
    const sessionId = uuid(body.sessionId, "sessionId");
    await db()`delete from sessions where id=${sessionId} and user_id=${user.userId} and organization_id=${user.organizationId}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error, request);
  }
}
