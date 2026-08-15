import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const helper = readFileSync(new URL("../lib/auth/session-cookie.ts", import.meta.url), "utf8");
const session = readFileSync(new URL("../lib/auth/session.ts", import.meta.url), "utf8");
const activation = readFileSync(new URL("../app/api/auth/activate/route.ts", import.meta.url), "utf8");
const devLogin = readFileSync(new URL("../app/api/auth/dev-login/route.ts", import.meta.url), "utf8");
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

const version = pkg.version.split(".").map(Number);
const minimum = "0.16.6".split(".").map(Number);
assert.ok(version[0] > minimum[0] || (version[0] === minimum[0] && (version[1] > minimum[1] || (version[1] === minimum[1] && version[2] >= minimum[2]))), `expected version 0.16.6 or newer`);
assert.match(helper, /priority: "high" as const/);
assert.match(helper, /httpOnly: true/);
assert.match(helper, /sameSite: "lax" as const/);
assert.match(helper, /maxAge: 0/);
assert.match(session, /expiredSessionCookieOptions/);
assert.match(session, /sessionCookieOptions\(expiresAt\)/);
assert.match(activation, /sessionCookieOptions\(expiresAt\)/);
assert.match(devLogin, /sessionCookieOptions\(sessionExpiry\(\)\)/);
assert.doesNotMatch(session + activation + devLogin, /const cookieName/);
console.log("v0.16.6 session lifecycle hardening checks passed");
