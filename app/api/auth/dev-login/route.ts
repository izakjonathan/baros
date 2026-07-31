import { NextResponse } from "next/server";
import { createDevSessionToken, isDevAuthEnabled, normalizeDevRole } from "@/lib/auth/dev-auth";

const cookieName = () => process.env.SESSION_COOKIE_NAME || "bar_ops_session";

export async function POST(request: Request) {
  if (!isDevAuthEnabled()) {
    return NextResponse.redirect(new URL("/login?error=dev-disabled", request.url), 303);
  }

  const form = await request.formData();
  const role = normalizeDevRole(form.get("role"));
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(cookieName(), createDevSessionToken(role), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
