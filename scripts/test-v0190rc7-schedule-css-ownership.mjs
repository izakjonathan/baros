import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const css = read("features/scheduling/ScheduleWorkspace.module.css");
const app = read("components/bar-ops-app.tsx");
const pkg = JSON.parse(read("package.json"));

if (!/^0\.19\.0-rc\.(?:[7-9]|[1-9]\d+)$/.test(pkg.version)) throw new Error("package version predates rc.7");
const owner = "v0.19.0-rc.7 — authoritative Shift Plan responsive ownership";
if ((css.match(new RegExp(owner.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length !== 1) {
  throw new Error("Shift Plan must have exactly one authoritative responsive owner");
}
for (const obsolete of [
  "v0.18.13.3 — physical-device schedule density",
  "v0.18.13.5 — authoritative mobile schedule selector",
  "v0.18.13.6 — authoritative mobile day-track sizing",
]) {
  if (css.includes(obsolete)) throw new Error(`Superseded schedule owner remains: ${obsolete}`);
}
for (const token of [
  "grid-template-columns:minmax(0,1fr) 4.9rem 2.35rem !important",
  "--mobile-day-column:6.55rem",
  "--mobile-day-separator:.16rem",
  "grid-auto-columns:var(--mobile-day-column) !important",
  "column-gap:var(--mobile-day-separator) !important",
  "inline-size:var(--mobile-day-column) !important",
  "opacity:0 !important",
  ".viewLabel",
]) {
  if (!css.includes(token)) throw new Error(`Accepted schedule contract missing: ${token}`);
}
const canonical = css.slice(css.indexOf(owner));
if (canonical.includes("calc((100vw")) throw new Error("Canonical tracks must not use viewport-derived widths");
if (app.includes('shift.status === "Draft" && <em>Draft</em>')) throw new Error("Draft pill returned");
if (!app.includes('data-draft={shift.status === "Draft"}')) throw new Error("Draft state attribute is missing");
if (!read("docs/SCHEDULE_CSS_OWNERSHIP.md").includes("6.55rem")) throw new Error("Schedule ownership document is incomplete");
const lineCount = css.split(/\r?\n/).length;
if (lineCount >= 2994) throw new Error("Schedule stylesheet was not consolidated");
console.log("v0.19.0-rc.7 Shift Plan CSS ownership regression passed");
