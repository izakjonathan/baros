import { createHmac, timingSafeEqual } from "node:crypto";
import type { AppRole, SessionUser } from "./session";

const allowedDevRoles: AppRole[] = ["OWNER", "ADMIN", "MANAGER", "SHIFT_MANAGER", "EMPLOYEE"];

export function isDevAuthEnabled() {
  if (process.env.DEV_AUTH_ENABLED === "false") return false;
  if (process.env.DEV_AUTH_ENABLED === "true") return true;
  return !process.env.DATABASE_URL;
}

function secret() {
  return process.env.DEV_AUTH_SECRET || "bar-ops-local-development-only";
}

export function getDevCredentials() {
  return {
    email: process.env.DEV_AUTH_EMAIL || "dev@barops.local",
    password: process.env.DEV_AUTH_PASSWORD || "dev",
  };
}

export function normalizeDevRole(value: unknown): AppRole {
  const role = String(value || "OWNER").toUpperCase() as AppRole;
  return allowedDevRoles.includes(role) ? role : "OWNER";
}

export function createDevSessionToken(role: AppRole = "OWNER") {
  const safeRole = normalizeDevRole(role);
  const payload = `bar-ops-dev-session-v2:${safeRole}`;
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyDevSessionToken(token: string): SessionUser | null {
  const separator = token.lastIndexOf(".");
  if (separator < 1) return null;

  const payload = token.slice(0, separator);
  const suppliedSignature = token.slice(separator + 1);
  const prefix = "bar-ops-dev-session-v2:";
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
  const names: Record<string, string> = {
    OWNER: "Development Owner",
    ADMIN: "Development Admin",
    MANAGER: "Development Manager",
    SHIFT_MANAGER: "Development Shift Manager",
    EMPLOYEE: "Development Employee",
  };

  return {
    userId: `dev-user-${safeRole.toLowerCase()}`,
    email: process.env.DEV_AUTH_EMAIL || "dev@barops.local",
    name: names[safeRole] || "Development Manager",
    role: safeRole,
    organizationId: "dev-organization",
    locationId: "dev-location",
    employeeId: null,
  };
}
