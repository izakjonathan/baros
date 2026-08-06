import fs from "node:fs";

const css = fs.readFileSync("features/scheduling/ScheduleWorkspace.module.css", "utf8");
const required = [
  "v0.19.0-rc.7 — canonical Shift Plan control and mobile track ownership",
  "--mobile-day-column:6.55rem",
  "--mobile-day-separator:.16rem",
  "grid-auto-columns:var(--mobile-day-column) !important",
  "column-gap:var(--mobile-day-separator) !important",
  "max-width:var(--mobile-day-column) !important",
];
for (const token of required) {
  if (!css.includes(token)) throw new Error(`Missing schedule-column containment token: ${token}`);
}
const block = css.slice(css.lastIndexOf("v0.19.0-rc.7 — canonical Shift Plan"));
if (block.includes("calc((100vw")) {
  throw new Error("Canonical schedule-column block must not derive track width from the viewport.");
}
console.log("Accepted Shift Plan column regression passed");
