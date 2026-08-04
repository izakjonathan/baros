const DEFAULT_COOKIE_NAME = "bar_ops_session";
const DEFAULT_TTL_DAYS = 30;

export function sessionCookieName() {
  return process.env.SESSION_COOKIE_NAME || DEFAULT_COOKIE_NAME;
}

export function sessionTtlDays() {
  const configured = Number(process.env.SESSION_TTL_DAYS || DEFAULT_TTL_DAYS);
  return Number.isInteger(configured) && configured >= 1 && configured <= 365
    ? configured
    : DEFAULT_TTL_DAYS;
}

export function sessionExpiry(now = Date.now()) {
  return new Date(now + sessionTtlDays() * 86_400_000);
}

export function sessionCookieOptions(expires = sessionExpiry()) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
    maxAge: Math.max(0, Math.floor((expires.getTime() - Date.now()) / 1000)),
    priority: "high",
  };
}

export function expiredSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
    priority: "high",
  };
}
