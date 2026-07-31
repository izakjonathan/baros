import { createHmac, timingSafeEqual } from "node:crypto";

const DEV_USER: import("./session").SessionUser = {
  userId: "dev-user",
  email: process.env.DEV_AUTH_EMAIL || "dev@barops.local",
  name: process.env.DEV_AUTH_NAME || "Development Manager",
  role: "OWNER",
  organizationId: "dev-organization",
  locationId: "dev-location",
  employeeId: null,
};

export function isDevAuthEnabled() {
  if (process.env.DEV_AUTH_ENABLED === "false") return false;
  if (process.env.DEV_AUTH_ENABLED === "true") return true;
  return process.env.NODE_ENV !== "production" && !process.env.DATABASE_URL;
}

function secret() {
  return process.env.DEV_AUTH_SECRET || "bar-ops-local-development-only";
}

export function getDevCredentials() {
  return {
    email: DEV_USER.email,
    password: process.env.DEV_AUTH_PASSWORD || "dev",
  };
}

export function createDevSessionToken() {
  const payload = "bar-ops-dev-session-v1";
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyDevSessionToken(token: string) {
  const expected = createDevSessionToken();
  const suppliedBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);
  return suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer);
}

export function getDevSessionUser() {
  return DEV_USER;
}
