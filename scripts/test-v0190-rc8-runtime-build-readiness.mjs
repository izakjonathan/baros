import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const verifier = readFileSync("scripts/verify-runtime-build-readiness.mjs", "utf8");
const workflow = readFileSync(".github/workflows/quality.yml", "utf8");

assert.match(pkg.version, /^0\.19\.0-rc\.(?:8|9|[1-9]\d+)$/);
assert.equal(pkg.packageManager, "npm@10.9.2");
assert.equal(pkg.scripts["verify:runtime-build"], "node scripts/verify-runtime-build-readiness.mjs");
assert.equal(pkg.scripts["test:rc8"], "node scripts/test-v0190-rc8-runtime-build-readiness.mjs");
assert.match(readFileSync(".npmrc", "utf8"), /registry=https:\/\/registry\.npmjs\.org\//);
assert.equal(existsSync("package-lock.json"), false, "Lockfile must not be fabricated while registry access is unavailable");
assert.match(verifier, /package-lock\.json is not available/);
assert.match(workflow, /npm run lint/);
assert.match(workflow, /npm run typecheck/);
assert.match(workflow, /npm run build/);
console.log("v0.19.0-rc.8 runtime-build readiness regression passed.");
