import { NextResponse } from "next/server";
import { createDevSessionToken, isDevAuthEnabled, normalizeDevRole } from "@/lib/auth/dev-auth";
import { sessionCookieName, sessionCookieOptions, sessionExpiry } from "@/lib/auth/session-cookie";
import { requestIdFrom } from "@/lib/observability";


export async function POST(request: Request) {
  const requestId = requestIdFrom(request);
  if (!isDevAuthEnabled()) {
    const response = NextResponse.redirect(new URL("/login?error=dev-disabled", request.url), 303);
    response.headers.set("cache-control", "no-store");
    response.headers.set("x-request-id", requestId);
    return response;
  }

  const form = await request.formData();
  const role = normalizeDevRole(form.get("role"));
  const destination = role === "EMPLOYEE" ? "/employee" : "/";
  const response = NextResponse.redirect(new URL(destination, request.url), 303);
  response.cookies.set(sessionCookieName(), createDevSessionToken(role), sessionCookieOptions(sessionExpiry()));
  response.headers.set("cache-control", "no-store");
  response.headers.set("x-request-id", requestId);
  return response;
}
