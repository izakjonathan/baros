import { createHmac, timingSafeEqual } from "node:crypto";
import type { AppRole, SessionUser } from "./session";

const allowedDevRoles: AppRole[] = ["OWNER", "ADMIN", "MANAGER", "SHIFT_MANAGER", "EMPLOYEE"];

export function isDevAuthEnabled() {
  const enabled = process.env.DEV_AUTH_ENABLED === "true";
  if (!enabled) return false;
  if (process.env.NODE_ENV === "production") {
    throw new Error("DEV_AUTH_ENABLED must never be true in production");
  }
  return true;
}

function secret() {
  const value = process.env.DEV_AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("DEV_AUTH_SECRET must be at least 32 characters");
  return value;
}

export function getDevCredentials() {
  const email = process.env.DEV_AUTH_EMAIL;
  const password = process.env.DEV_AUTH_PASSWORD;
  if (!email || !password || password.length < 12) throw new Error("Explicit development credentials are required");
  return { email, password };
}

export function normalizeDevRole(value: unknown): AppRole {
  const role = String(value || "EMPLOYEE").toUpperCase() as AppRole;
  return allowedDevRoles.includes(role) ? role : "EMPLOYEE";
}

export function createDevSessionToken(role: AppRole = "OWNER") {
  const safeRole = normalizeDevRole(role);
  const payload = `bar-ops-dev-session-v3:${safeRole}`;
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyDevSessionToken(token: string): SessionUser | null {
  const separator = token.lastIndexOf(".");
  if (separator < 1) return null;
  const payload = token.slice(0, separator);
  const suppliedSignature = token.slice(separator + 1);
  const prefix = "bar-ops-dev-session-v3:";
  if (!payload.startsWith(prefix)) return null;
  const role = normalizeDevRole(payload.slice(prefix.length));
  const expectedSignature = createHmac("sha256", secret()).update(payload).digest("base64url");
  const suppliedBuffer = Buffer.from(suppliedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) return null;
  return getDevSessionUser(role);
}

export function getDevSessionUser(role: AppRole = "OWNER"): SessionUser {
  const safeRole = normalizeDevRole(role);
  const names: Record<AppRole, string> = {
    OWNER: "Development Owner", ADMIN: "Development Admin", MANAGER: "Development Manager",
    SHIFT_MANAGER: "Development Shift Manager", EMPLOYEE: "Development Employee",
  };
  return { userId: `dev-user-${safeRole.toLowerCase()}`, email: process.env.DEV_AUTH_EMAIL || "dev@barops.local", name: names[safeRole], role: safeRole, organizationId: "dev-organization", locationId: "dev-location", employeeId: null };
}
