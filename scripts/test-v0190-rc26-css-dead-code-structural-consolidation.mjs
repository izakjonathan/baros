import assert from "node:assert/strict";
import fs from "node:fs";

const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const globals=fs.readFileSync("app/globals.css","utf8");
const schedule=fs.readFileSync("features/scheduling/ScheduleWorkspace.module.css","utf8");
const ownership=fs.readFileSync("docs/CSS_OWNERSHIP.md","utf8");

assert.match(pkg.version,/^0\.19\.0-rc\.(?:2[6-9]|[3-9]\d|\d{3,})$/);
assert.ok(globals.length < 85000, `globals.css should remain structurally consolidated; got ${globals.length} bytes`);
assert.ok(!fs.existsSync("app/mono-components.css"), "legacy mono-components.css must remain removed on rc.34+");
assert.doesNotMatch(globals,/\.schedule-summary\b/,"dead legacy schedule-summary selector must not return");
assert.ok((schedule.match(/!important/g)||[]).length<=500,"Schedule important usage must not regress");
assert.match(ownership,/dead selector/i);
assert.match(ownership,/live markup/i);
console.log("v0.19.0-rc.26 CSS dead-code and structural consolidation checks passed");
