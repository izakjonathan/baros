import fs from "node:fs";

const session = fs.readFileSync("lib/auth/session.ts", "utf8");
const clock = fs.readFileSync("app/api/time-clock/route.ts", "utf8");
const hours = fs.readFileSync("app/api/employee/hours-summary/route.ts", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const checks = [
  ["release version", ["0.10.7", "0.10.8","0.10.9","0.10.10","0.10.11","0.11.0","0.11.1","0.11.2","0.11.3","0.11.4","0.11.6","0.12.0","0.12.1","0.12.2","0.12.3","0.12.4","0.13.0","0.13.1","0.13.2"].includes(pkg.version)],
  ["development employee resolves a real linked profile", session.includes('devUser.role === "EMPLOYEE"') && session.includes("from employee_locations")],
  ["development session no longer exposes fake location to database routes", session.includes("{ ...devUser, locationId: null }")],
  ["real session validates the stored location", session.includes("valid_session_location.active=true")],
  ["real session falls back to an employee location", session.includes("coalesce(valid_session_location.id,employee_location.location_id)")],
  ["employee lookup is organization scoped and active", session.includes("e.organization_id=s.organization_id and e.active=true")],
  ["time clock keeps explicit linkage validation", clock.includes("A linked employee profile and location are required")],
  ["hours summary keeps explicit employee validation", hours.includes("A linked employee profile is required")],
];

for (const [name, ok] of checks) {
  if (!ok) throw new Error(`v0.10.7 check failed: ${name}`);
  console.log(`✓ ${name}`);
}
