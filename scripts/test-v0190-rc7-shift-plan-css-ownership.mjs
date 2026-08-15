import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const css = read("features/scheduling/ScheduleWorkspace.module.css");
const pkg = JSON.parse(read("package.json"));

if (!/^0\.19\.0-rc\.(?:[7-9]|[1-9]\d+)$/.test(pkg.version)) throw new Error("package version predates rc.7");
if ((css.match(/v0\.19\.0-rc\.7 — canonical Shift Plan/g) || []).length !== 1) {
  throw new Error("Shift Plan must have one canonical rc.7 ownership block");
}
for (const retired of ["v0.18.13.3 — physical-device", "v0.18.13.5 — authoritative", "v0.18.13.6 — authoritative"]) {
  if (css.includes(retired)) throw new Error(`retired schedule correction layer remains: ${retired}`);
}
for (const contract of [
  "--mobile-day-column:6.55rem",
  "--mobile-day-separator:.16rem",
  "grid-auto-columns:var(--mobile-day-column)",
  "inline-size:var(--mobile-day-column)",
  "grid-template-columns:minmax(0,1fr) 4.9rem 2.35rem",
  "opacity:0",
  ".viewLabel",
]) {
  if (!css.includes(contract)) throw new Error(`accepted schedule contract missing: ${contract}`);
}
const importantCount = (css.match(/!important/g) || []).length;
if (importantCount >= 831) throw new Error(`Shift Plan specificity was not reduced: ${importantCount}`);
if (!read("docs/SHIFT_PLAN_CSS_OWNERSHIP.md").includes("Canonical mobile ownership")) {
  throw new Error("Shift Plan CSS ownership map is missing");
}
console.log(`v0.19.0-rc.7 Shift Plan CSS ownership regression passed (${importantCount} !important declarations)`);
