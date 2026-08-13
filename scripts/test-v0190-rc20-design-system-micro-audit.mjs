import fs from "node:fs";
import assert from "node:assert/strict";

const tokens=fs.readFileSync("styles/tokens.css","utf8");
const shared=fs.readFileSync("app/system-contracts.css","utf8");
const employee=fs.readFileSync("app/employee/EmployeeWorkspace.css","utf8");
const native=fs.readFileSync("components/ui/NativeDateTimeField.module.css","utf8");
const button=fs.readFileSync("components/ui/primitives/Button.module.css","utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));

const rcMatch = pkg.version.match(/^0\.19\.0-rc\.(\d+)$/);
assert.ok(rcMatch, "package version must remain within the v0.19.0 RC line");
assert.ok(Number(rcMatch[1]) >= 20, "rc.20 design-system contract applies to rc.20 and later");
for (const token of ["--text-control","--text-label","--text-helper","--text-caption","--control-height-compact","--control-height-default","--control-height-large","--control-padding-x","--control-border-width","--control-radius"]) {
  assert.ok(tokens.includes(token+":"),`missing canonical micro token ${token}`);
}
assert.ok(shared.includes("var(--control-height-default)"),"shared controls must consume default control height token");
assert.ok(button.includes("font-size:var(--text-control)"),"Button primitive must consume control typography role");
assert.ok(button.includes("min-height:var(--control-height-default)"),"Button primitive must consume default control height");
assert.ok(native.includes("font-size:var(--text-label)"),"native date/time label must consume label role");
assert.ok(native.includes("border:var(--control-border-width) solid currentColor"),"native date/time field must consume canonical border width");
assert.ok(native.includes("min-height:var(--control-height-default)"),"native date/time field must consume default control height");
assert.ok(employee.includes("font-size: var(--text-label); font-weight: var(--weight-label);"),"employee form labels must consume canonical label role");
assert.ok(employee.includes("min-height: var(--control-height-default)"),"employee forms/buttons must consume canonical control height");
assert.ok(employee.includes("height: 34px; min-height: 34px"),"schedule compact actions must preserve rc.19 root-cause fix");
console.log("rc.20 design-system micro-audit contract passed");
