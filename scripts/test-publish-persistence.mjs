import fs from "node:fs";
const app=fs.readFileSync("components/bar-ops-app.tsx","utf8");
const route=fs.readFileSync("app/api/schedule-publish/route.ts","utf8");
const checks=[
  [app.includes('persist("/api/schedule-publish"'),"manager publish calls persistent API"],
  [app.includes('weekStart')&&app.includes('weekEnd'),"publish sends explicit week range"],
  [app.includes('selectedLocationId'),"publish sends location context"],
  [app.includes('publishing ? "Publishing…"'),"publish has in-flight state"],
  [app.includes('shift.status === "Draft" ? { ...shift, status: "Published" }'),"only draft shifts update after confirmation"],
  [route.includes("update shifts set status='PUBLISHED'"),"database publish updates shift status"],
  [route.includes('db().begin'),"database publish is transactional"]
];
for(const [ok,label] of checks){if(!ok)throw new Error(`FAIL: ${label}`);console.log(`PASS: ${label}`)}
