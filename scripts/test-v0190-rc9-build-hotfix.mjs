import assert from "node:assert/strict";
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const app = fs.readFileSync("components/bar-ops-app.tsx", "utf8");
assert.match(pkg.version, /^0\.19\.0-rc\.(?:9|[1-9][0-9]+)$/);
assert.match(app, /note:x\.manager_note \?\? undefined/);
assert.doesNotMatch(app, /note:x\.manager_note,onBreak/);
console.log("v0.19.0-rc.9 Vercel TypeScript hotfix regression passed.");
