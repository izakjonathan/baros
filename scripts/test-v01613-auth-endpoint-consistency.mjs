import assert from "node:assert/strict";
import fs from "node:fs";

const activation = fs.readFileSync("app/api/auth/activate/route.ts", "utf8");
const devLogin = fs.readFileSync("app/api/auth/dev-login/route.ts", "utf8");

for (const source of [activation, devLogin]) {
  assert.match(source, /requestIdFrom\(request\)/);
  assert.match(source, /cache-control/);
  assert.match(source, /x-request-id/);
}
assert.match(activation, /requestId/);
assert.match(devLogin, /response\.headers\.set\("x-request-id", requestId\)/);
console.log("v0.16.13 authentication endpoint consistency checks passed");
