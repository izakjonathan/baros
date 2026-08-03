import fs from "node:fs";
const read=(p)=>fs.readFileSync(p,"utf8");
const pkg=JSON.parse(read("package.json"));
const hours=read("app/api/employee/hours-summary/route.ts");
const employees=read("app/api/employees/route.ts");
const bootstrap=read("app/api/manager/bootstrap/route.ts");
const app=read("components/bar-ops-app.tsx");
const clock=read("app/api/time-clock/route.ts");
const checks=[
 [["0.10.10","0.10.11","0.11.0","0.11.1","0.11.2"].includes(pkg.version),"release version"],
 [hours.includes("date_part('epoch', s.ends_at - s.starts_at)")&&!hours.includes("extract(epoch from (s.ends_at-s.starts_at)"),"runtime-safe scheduled-hours SQL"],
 [hours.includes("const [approved]")&&hours.includes("const summary ="),"separate typed summary queries"],
 [employees.includes("body.locationId !== undefined")&&employees.includes("delete from employee_locations")&&employees.includes("primary_location) values"),"transactional location reassignment"],
 [employees.includes("Location does not belong to this organization or is inactive"),"tenant and active-location validation"],
 [employees.includes("Portal-enabled employees must have an assigned location"),"portal location invariant"],
 [bootstrap.includes("'primary',el.primary_location"),"primary assignment returned by bootstrap"],
 [app.includes("Primary location")&&app.includes("locationId:(e.locations||[]).find"),"manager location selector and mapping"],
 [clock.includes("eligibilityReason")&&clock.includes("No location is assigned to this employee"),"clock eligibility reason"]
];
let failed=0; for(const [ok,label] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`); if(!ok) failed++;} if(failed) process.exit(1);
