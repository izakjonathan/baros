import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./validate-environment.mjs", import.meta.url), "utf8");
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
assert.match(pkg.version, /^0\.16\.(?:[5-9]|[1-9]\d)(?:\.\d+)?$/);
assert.equal(pkg.engines.node, "24.x");
assert.match(source, /postgresql:/);
assert.match(source, /APP_URL must use https in production/);
assert.match(source, /SESSION_TTL_DAYS must be an integer between 1 and 365/);
assert.match(source, /SESSION_COOKIE_NAME/);
console.log("v0.16.5 configuration integrity checks passed");
