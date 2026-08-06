import fs from "node:fs";

const css = fs.readFileSync("features/scheduling/ScheduleWorkspace.module.css", "utf8");
const required = [
  "v0.18.13.6 — authoritative mobile day-track sizing",
  "--mobile-day-column:6.55rem !important",
  "--mobile-day-separator:.16rem !important",
  "grid-auto-columns:var(--mobile-day-column) !important",
  "column-gap:var(--mobile-day-separator) !important",
  "max-width:var(--mobile-day-column) !important",
];
for (const token of required) {
  if (!css.includes(token)) throw new Error(`Missing schedule-column containment token: ${token}`);
}
const block = css.slice(css.lastIndexOf("v0.18.13.6 — authoritative mobile day-track sizing"));
if (block.includes("calc((100vw")) {
  throw new Error("Authoritative schedule-column block must not derive track width from the viewport.");
}
console.log("v0.18.13.6 schedule column regression passed");
