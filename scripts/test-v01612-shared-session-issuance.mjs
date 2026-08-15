import assert from "node:assert/strict";
import { isVersionAtLeast } from "./version-utils.mjs";
import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
assert.equal(isVersionAtLeast(pkg.version, "0.16.12"), true);

const session = fs.readFileSync("lib/auth/session.ts", "utf8");
const store = fs.readFileSync("lib/auth/session-store.ts", "utf8");
const activation = fs.readFileSync("app/api/auth/activate/route.ts", "utf8");

assert.match(store, /export async function persistSessionRecord/);
assert.match(store, /delete from sessions where expires_at <= now\(\)/);
assert.match(store, /offset \$\{retain\}/);
assert.match(session, /persistSessionRecord\(transaction/);
assert.match(activation, /persistSessionRecord\(tx/);
assert.doesNotMatch(activation, /insert into sessions\(/);
assert.doesNotMatch(activation, /sessionTokenHash/);
console.log("v0.16.12 shared session issuance checks passed");
