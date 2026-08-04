import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const workflow = readFileSync(new URL("../.github/workflows/quality.yml", import.meta.url), "utf8");
const version = pkg.version.split(".").map(Number);
const minimum = "0.16.7".split(".").map(Number);
assert.ok(version[0] > minimum[0] || (version[0] === minimum[0] && (version[1] > minimum[1] || (version[1] === minimum[1] && version[2] >= minimum[2]))), `expected version 0.16.7 or newer`);
assert.equal(pkg.engines.node, "24.x");
assert.match(workflow, /node-version: 24/);
assert.match(workflow, /npm install --no-audit --no-fund/);
for (const section of [pkg.dependencies, pkg.devDependencies]) {
  for (const [name, version] of Object.entries(section)) {
    assert.doesNotMatch(version, /^[~^*]|\bx\b/i, `${name} must be pinned`);
  }
}
console.log("v0.16.7 CI runtime alignment checks passed");
