import fs from "node:fs";
const app = fs.readFileSync("components/bar-ops-app.tsx", "utf8");
const data = fs.readFileSync("lib/data.ts", "utf8");
const checks = [
  [data.includes("employeeId?: string"), "Shift type keeps employee UUID"],
  [app.includes("employeeId: x.employee_id || undefined"), "Database shift mapper keeps employee UUID"],
  [app.includes("shifts={shifts}"), "Team receives live shift state"],
  [app.includes("Scheduled next 4 weeks"), "Team labels scheduled-hours period"],
  [app.includes("shift.employeeId === person.id"), "Scheduled hours match immutable employee ID"],
  [app.includes('shift.status === "Published"'), "Only published shifts count"],
  [app.includes("hoursBetween(shift.start, shift.end)"), "Overnight-aware duration helper is used"],
];
let failed = false;
for (const [ok, label] of checks) { console.log(`${ok ? "✓" : "✗"} ${label}`); if (!ok) failed = true; }
if (failed) process.exit(1);
