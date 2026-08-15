import fs from "node:fs";

const component = fs.readFileSync("components/bar-ops-app.tsx", "utf8");
const css = fs.readFileSync("features/attendance/AttendanceWorkspace.module.css", "utf8");

const checks = [
  [component.includes("formatAttendanceDate(fromDate)"), "From date uses component-rendered visual label"],
  [component.includes("formatAttendanceDate(toDate)"), "To date uses component-rendered visual label"],
  [component.includes('aria-label="Payroll period from date"'), "From native input keeps an accessible name"],
  [component.includes('aria-label="Payroll period to date"'), "To native input keeps an accessible name"],
  [css.includes(".dateControl{"), "Attendance owns a dedicated date-control wrapper"],
  [css.includes('opacity:0;\n  cursor:pointer;'), "Native date input is retained as the invisible interaction layer"],
  [css.includes("place-items:center"), "Visible date value is centered by normal layout"],
  [css.includes("grid-template-columns:repeat(2,minmax(0,1fr))"), "Paired date tracks remain intrinsically shrinkable"],
  [!css.includes("::-webkit-date-and-time-value"), "Attendance no longer styles Safari-owned internal date text"],
  [!css.includes("::-webkit-datetime-edit"), "Attendance no longer depends on WebKit internal edit alignment"],
];

for (const [ok, message] of checks) {
  if (!ok) throw new Error(message);
  console.log(`✓ ${message}`);
}
console.log("v0.18.13.4 date-control root-cause regression passed");
