import fs from "node:fs";
function assert(ok, message) { if (!ok) throw new Error(message); }
const component = fs.readFileSync("components/bar-ops-app.tsx", "utf8");
const schedule = fs.readFileSync("features/scheduling/ScheduleWorkspace.module.css", "utf8");
const attendance = fs.readFileSync("features/attendance/AttendanceWorkspace.module.css", "utf8");
assert(component.includes("className={scheduleStyles.viewLabel}"), "Schedule view must use component-owned visible text");
assert(component.includes('aria-label="Schedule view"'), "Native schedule select must retain an accessible name");
assert(schedule.includes("opacity:0 !important"), "Native select must be the invisible interaction layer");
assert(schedule.includes("grid-template-columns:none !important"), "Mobile schedule must defeat the legacy seven-column template");
assert(schedule.includes("grid-auto-flow:column !important"), "Mobile schedule must own column flow");
assert(schedule.includes("column-gap:0 !important"), "Day columns must not regain historical inter-column spacing");
assert(attendance.includes("line-height:1.25"), "Visible date labels need descender-safe line height");
assert(attendance.includes("padding-block:.12em"), "Visible date labels need descender-safe block padding");
console.log("v0.18.13.5 schedule/date root-cause regression passed");
