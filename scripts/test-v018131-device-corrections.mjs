import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const shell = read("components/shell/ManagerShell.module.css");
const inventory = read("features/inventory/InventoryWorkspace.module.css");
const orders = read("features/orders/OrdersWorkspace.module.css");
const attendance = read("features/attendance/AttendanceWorkspace.module.css");
const operations = read("features/operations/DailyOperations.module.css");
const dashboard = read("features/dashboard/Dashboard.module.css");
const pkg = JSON.parse(read("package.json"));

const checks = [
  [pkg.version === "0.18.13.1", "package version is 0.18.13.1"],
  [shell.includes("position:sticky") && shell.includes("left:auto") && shell.includes("right:auto"), "mobile manager header is sticky and in flow"],
  [inventory.includes("grid-template-columns:auto minmax(0,1fr)") && inventory.includes("background:transparent!important"), "inventory search owns its internal input composition"],
  [orders.includes("grid-template-columns:auto minmax(0,1fr)") && orders.includes("overflow:hidden"), "orders search is contained"],
  [inventory.includes("min-inline-size:2.5rem") && inventory.includes(".editButton :global(svg)"), "inventory edit control is a visible square action"],
  [attendance.includes(".periodFields{gap:.62rem}") && attendance.includes("input[type=\"date\"]"), "paired attendance dates retain a real gap"],
  [operations.includes(".create{grid-template-columns:minmax(0,1fr) minmax(7.5rem,.55fr) auto") && operations.includes(".compose textarea{min-height:6.5rem"), "daily operations mobile composition is compact"],
  [dashboard.includes("quick-action:nth-child(6)") && dashboard.includes("grid-template-columns:2.5rem minmax(0,1fr) auto"), "quick actions use one row structure and explicit color mapping"],
];

for (const [ok, message] of checks) {
  if (!ok) throw new Error(`v0.18.13.1 regression failed: ${message}`);
  console.log(`✓ ${message}`);
}
console.log("v0.18.13.1 physical-device corrections regression passed");
