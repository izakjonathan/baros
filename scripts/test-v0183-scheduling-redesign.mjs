import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const app = fs.readFileSync("components/bar-ops-app.tsx", "utf8");
const css = fs.readFileSync("features/scheduling/ScheduleWorkspace.module.css", "utf8");

const errors = [];
const [major, minor, patch] = pkg.version.split(".").map(Number);
if (major !== 0 || minor < 18 || (minor === 18 && patch < 3)) errors.push(`Expected package version 0.18.3 or newer, received ${pkg.version}`);
if (!app.includes('ScheduleWorkspace.module.css')) errors.push("Schedule workspace CSS Module is not imported");
if (!app.includes("scheduleStyles.calendarPanel")) errors.push("Schedule calendar does not use the feature-owned module");
if (!app.includes('data-role={shift.role}')) errors.push("Shift cards do not expose role styling state");
if (!app.includes('data-draft={shift.status === "Draft"}')) errors.push("Shift cards do not expose draft styling state");
if (!app.includes('data-conflict={Boolean(conflict)}')) errors.push("Shift cards do not expose conflict styling state");
for (const token of ["var(--surface-card)", "var(--space-3)", "var(--radius-card)", "var(--duration-fast)"]) {
  if (!css.includes(token)) errors.push(`Schedule module is missing design token ${token}`);
}
if (!css.includes("overflow-x:auto")) errors.push("Schedule calendar lacks intentional horizontal scrolling");
if (!css.includes("prefers-reduced-motion")) errors.push("Schedule module lacks reduced-motion handling");
if (!app.includes('aria-pressed={showConflictsOnly}')) errors.push("Conflict filter accessibility state was lost");
if (!app.includes('onDrop={async (e)=>')) errors.push("Drag-and-drop scheduling behavior was lost");

if (errors.length) {
  console.error(errors.map((error) => `v0.18.3 ERROR: ${error}`).join("\n"));
  process.exit(1);
}
console.log("v0.18.3 scheduling redesign regression passed");
