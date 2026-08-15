import assert from "node:assert/strict";
import fs from "node:fs";

const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const schedule=fs.readFileSync("features/scheduling/ScheduleWorkspace.module.css","utf8");
const employee=fs.readFileSync("app/employee/EmployeeWorkspace.css","utf8");
const attendance=fs.readFileSync("features/attendance/AttendanceWorkspace.module.css","utf8");
const requests=fs.readFileSync("features/requests/RequestsWorkspace.module.css","utf8");
const globalBridge=fs.readFileSync("app/globals.css","utf8");
const monoTokens=fs.readFileSync("styles/tokens.css","utf8");
const designSystem=fs.readFileSync("app/design-system.css","utf8");
const layout=fs.readFileSync("app/layout.tsx","utf8");
const ownership=fs.readFileSync("docs/CSS_OWNERSHIP.md","utf8");

assert.match(pkg.version,/^0\.19\.0-rc\.(?:2[5-9]|[3-9]\d+)$/, "rc.25 consolidation contract must remain valid on rc.25 or later");
assert.match(designSystem,/^@layer reset, tokens, base, layouts, components, utilities;/m);
assert.doesNotMatch(layout,/mono-tokens\.css/);
assert.match(monoTokens,/--mono-canvas:\s*var\(--surface-page\);/);
assert.match(monoTokens,/--workspace-card-padding:18px;/);

const scheduleImportant=(schedule.match(/!important/g)||[]).length;
assert.ok(scheduleImportant<=500,`Schedule !important count must remain <=500, got ${scheduleImportant}`);
assert.ok(schedule.split(/\r?\n/).length<2200,"Schedule stylesheet must remain consolidated below 2200 physical lines");
assert.match(schedule,/v0\.19\.0-rc\.7 — canonical Shift Plan control and mobile track ownership/);
assert.doesNotMatch(schedule,/rc\.25[^\n]*(?:override|patch)/i);

for (const [name,css] of [["employee",employee],["attendance",attendance],["requests",requests],["global-bridge",globalBridge]]) {
  assert.ok(css.length>0,`${name} stylesheet must remain present`);
}
assert.match(ownership,/Do not fix a cascade conflict by adding a later opposite declaration/);
assert.match(ownership,/rc\.25 consolidation gate/);

console.log(`v0.19.0-rc.25 CSS cascade consolidation checks passed (${scheduleImportant} schedule !important declarations)`);
