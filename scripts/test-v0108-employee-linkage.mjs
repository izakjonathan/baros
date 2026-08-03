import fs from "node:fs";

const session = fs.readFileSync("lib/auth/session.ts", "utf8");
const clock = fs.readFileSync("app/api/time-clock/route.ts", "utf8");
const hours = fs.readFileSync("app/employee/hours/page.tsx", "utf8");

const checks = [
  ["session resolves employee location", /left join lateral[\s\S]*employee_locations[\s\S]*primary_location desc/.test(session)],
  ["session accepts only active linked employee", /e\.active = true/.test(session)],
  ["single active location fallback is constrained", /having count\(\*\) = 1/.test(session)],
  ["clock GET reports missing linkage without server error", /eligibilityError/.test(clock) && /eligible: false/.test(clock)],
  ["employee hours surfaces linkage reason", /clockData\.eligibilityError/.test(hours)],
];

for (const [name, ok] of checks) {
  if (!ok) {
    console.error(`FAIL: ${name}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${name}`);
  }
}
