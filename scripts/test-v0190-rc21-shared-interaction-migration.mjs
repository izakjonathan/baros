import fs from "node:fs";
import assert from "node:assert/strict";

const completion = fs.readFileSync("app/completion-redesign.css", "utf8");
const mono = fs.readFileSync("app/mono-components.css", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

assert.equal(pkg.version, "0.19.0-rc.21");

for (const contract of [
  "login-card label{display:grid;gap:var(--space-2);font-size:var(--text-label);font-weight:var(--weight-label)",
  "login-card input{inline-size:100%;max-inline-size:100%;min-inline-size:0;box-sizing:border-box;min-height:var(--control-height-default);border:var(--control-border-width) solid #000;border-radius:var(--control-radius)",
  "modal label{min-inline-size:0;font-size:var(--text-label);font-weight:var(--weight-label)",
  "modal input,.modal select,.modal textarea{inline-size:100%;max-inline-size:100%;min-inline-size:0;box-sizing:border-box;border:var(--control-border-width) solid #000;border-radius:var(--control-radius)",
  "modal-actions button,.interaction-actions button{min-height:var(--control-height-default);border-radius:var(--radius-control);border:var(--control-border-width) solid #000;font-size:var(--text-control);font-weight:var(--weight-control)",
  "top-popover label{display:flex;align-items:center;gap:var(--space-2);min-height:var(--control-height-default)",
  "top-popover button{width:100%;min-width:0;min-height:var(--control-height-compact)",
]) assert.ok(completion.includes(contract), `missing shared interaction contract: ${contract}`);

assert.ok(mono.includes("workspace-description,.employee-lead{max-width:68ch;margin:0;color:var(--mono-secondary);font-size:var(--text-helper);line-height:1.4}"), "workspace helper copy must use canonical helper role");
assert.ok(mono.includes("shared-empty-state{display:grid;justify-items:center;gap:var(--space-2);min-height:6rem;padding:var(--space-5)"), "shared empty state must use compact spacing contract");
assert.ok(mono.includes("shared-state-card{min-height:7rem;display:grid"), "shared loading/error state must use compact height contract");
assert.ok(mono.includes("shared-state-card strong{font-size:var(--text-control);font-weight:var(--weight-control)"), "shared state title must use canonical control typography");

// rc.19 schedule action-height ownership must remain intact through the migration.
const employee = fs.readFileSync("app/employee/EmployeeWorkspace.css", "utf8");
assert.ok(employee.includes("height: 34px; min-height: 34px"), "schedule compact action height ownership regressed");

console.log("rc.21 shared interaction migration contract passed");
