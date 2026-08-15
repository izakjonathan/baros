import fs from "node:fs";
import assert from "node:assert/strict";

const completion = fs.readFileSync("app/completion-redesign.css", "utf8");
const globals = fs.readFileSync("app/globals.css", "utf8");
const employeeCss = fs.readFileSync("app/employee/EmployeeWorkspace.css", "utf8");
const system = fs.readFileSync("app/system-contracts.css", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

assert.match(pkg.version, /^0\.19\.0-rc\.(?:2[1-9]|[3-9]\d|\d{3,})$/, "rc.21 interaction contract must remain valid on rc.21 or later");

for (const contract of [
  "login-card label{display:grid;gap:var(--space-2);font-size:var(--text-label);font-weight:var(--weight-label)",
  "login-card input{min-height:var(--control-height-default);border:var(--control-border-width) solid #000;border-radius:var(--control-radius)",
  "modal label{min-inline-size:0;font-size:var(--text-label);font-weight:var(--weight-label)",
  "modal input,.modal select,.modal textarea{border:var(--control-border-width) solid #000;border-radius:var(--control-radius)",
  "modal-actions button,.interaction-actions button{min-height:var(--control-height-default);border-radius:var(--radius-control);border:var(--control-border-width) solid #000;font-size:var(--text-control);font-weight:var(--weight-control)",
  "top-popover label{display:flex;align-items:center;gap:var(--space-2);min-height:var(--control-height-default)",
  "top-popover button{width:100%;min-width:0;min-height:var(--control-height-compact)",
]) assert.ok(completion.includes(contract), `missing shared interaction contract: ${contract}`);

assert.ok(globals.includes("page-subtitle") && globals.includes("font-size:var(--text-helper)"), "workspace helper copy must use canonical helper role");
assert.ok(employeeCss.includes(".employee-app .empty-portal"), "employee state presentation must remain feature-owned");

assert.ok(system.includes(':where(.app-frame,.employee-app,.login-page,.modal-layer) :where(input,select,textarea){') && system.includes("box-sizing: border-box"), "intrinsic control sizing must be owned by the consolidated system contract");

// rc.19 schedule action-height ownership must remain intact through the migration.
const employee = fs.readFileSync("app/employee/EmployeeWorkspace.css", "utf8");
assert.ok(employee.includes("height: 34px; min-height: 34px"), "schedule compact action height ownership regressed");

console.log("rc.21 shared interaction migration contract passed");
