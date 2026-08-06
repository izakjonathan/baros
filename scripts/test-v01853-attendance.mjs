import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const css = fs.readFileSync("features/attendance/AttendanceWorkspace.module.css", "utf8");
const app = fs.readFileSync("components/bar-ops-app.tsx", "utf8");
const fail = (message) => { console.error(`v0.18.5.3 regression: ${message}`); process.exit(1); };

if (pkg.version !== "0.18.5.3") fail("package version mismatch");
if (!css.includes("v0.18.5.3 — iPhone Time & Attendance layout polish")) fail("focused layout block missing");
if (!css.includes(".periodFields{gap:.52rem}")) fail("separated paired date controls missing");
if (!css.includes(".actions button:disabled")) fail("disabled action contrast treatment missing");
if (!css.includes("min-height:4.1rem")) fail("compact empty state missing");
if (!css.includes("min-height:3.9rem")) fail("compact summary cards missing");
if (!app.includes("No timesheets found")) fail("timesheet empty state missing");
if (!app.includes("Open period")) fail("period state missing");

console.log("v0.18.5.3 Time & Attendance layout regression passed");
