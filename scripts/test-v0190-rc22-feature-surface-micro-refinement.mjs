import fs from "node:fs";
import assert from "node:assert/strict";
const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),"utf8");
const pkg=JSON.parse(read("package.json"));
assert.equal(pkg.version,"0.19.0-rc.22");
const targets=[
  "app/employee/EmployeeWorkspace.css",
  "features/attendance/AttendanceWorkspace.module.css",
  "features/requests/RequestsWorkspace.module.css",
  "features/employees/TeamWorkspace.module.css",
  "features/inventory/InventoryWorkspace.module.css",
  "features/orders/OrdersWorkspace.module.css",
  "features/operations/DailyOperations.module.css",
  "features/settings/SettingsWorkspace.module.css",
];
for (const target of targets){
  const css=read(target);
  assert.match(css,/v0\.19\.0-rc\.22/);
  assert.match(css,/--text-(?:control|label|helper|caption)/);
}
assert.match(read("app/employee/EmployeeWorkspace.css"),/\.shift-action-row \.shift-card-action \{[^}]*height: 34px;[^}]*min-height: 34px;/s);
assert.match(read("features/attendance/AttendanceWorkspace.module.css"),/\.filters input,\.filters select\{height:var\(--control-height-default\)/);
assert.match(read("features/requests/RequestsWorkspace.module.css"),/\.refresh,\.actions button\{min-height:var\(--control-height-default\)/);
assert.match(read("features/settings/SettingsWorkspace.module.css"),/\.fields input,\.fields select\{min-height:var\(--control-height-default\)/);
console.log("v0.19.0-rc.22 feature-surface micro-refinement regression passed");
