import fs from "node:fs";
const read = (path) => fs.readFileSync(path, "utf8");
const pkg = JSON.parse(read("package.json"));
const page = read("app/employee/hours/page.tsx");
const boundary = read("app/employee/hours/error.tsx");
const checks = [
  [pkg.version === "0.10.11", "release version"],
  [page.includes('value.match(/^\\d{4}-\\d{2}-\\d{2}/)?.[0]') && page.includes('dateOnly && datePart'), "date-only normalization accepts ISO timestamps"],
  [page.includes('Number.isNaN(parsed.getTime()) ? null : parsed') && page.includes('return "Unknown date"'), "invalid dates cannot crash formatting"],
  [page.includes('Array.isArray(hoursData.timesheets)'), "timesheet payload guarded before rendering"],
  [page.includes('geolocationErrorMessage') && page.includes('Location access was denied') && page.includes('Location check timed out'), "geolocation failures become inline messages"],
  [(page.match(/type="button"/g) || []).length >= 7, "clock and modal controls use explicit button types"],
  [boundary.includes('Your clock record is safe') && boundary.includes('reset'), "route-specific recovery boundary"]
];
let failed = 0;
for (const [ok, label] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${label}`); if (!ok) failed++; }
if (failed) process.exit(1);
