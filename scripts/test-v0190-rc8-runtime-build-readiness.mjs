import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
assert.equal(pkg.version, "0.19.0-rc.8");
assert.equal(pkg.packageManager, "npm@10.9.2");
assert.equal(pkg.scripts["verify:runtime-build"], "node scripts/verify-runtime-build-readiness.mjs");
assert.equal(pkg.scripts["test:rc8"], "node scripts/test-v0190-rc8-runtime-build-readiness.mjs");
assert.match(readFileSync(".npmrc", "utf8"), /registry=https:\/\/registry\.npmjs\.org\//);
assert.ok(existsSync("RUNTIME_BUILD_READINESS.md"));
assert.ok(existsSync("RELEASE_NOTES_RC8.md"));
assert.match(readFileSync("RUNTIME_BUILD_READINESS.md", "utf8"), /package-lock\.json.*not available/i);
assert.match(readFileSync("RUNTIME_BUILD_READINESS.md", "utf8"), /EAI_AGAIN|DNS/i);
console.log("v0.19.0-rc.8 runtime-build readiness regression passed.");
