import fs from "node:fs";
const route=fs.readFileSync("app/api/operation-checklists/route.ts","utf8");
const ui=fs.readFileSync("components/bar-ops-app.tsx","utf8");
const checks=[
  [route.includes("service_date=${serviceDate}::date"),"date-scoped checklist query"],
  [ui.includes('type="date"')&&ui.includes("serviceDate"),"history date control"],
  [ui.includes("disabled={!isToday||savingId===t.id}")&&ui.includes('{isToday&&<span className={operationsStyles.rowActions}>'),"historical days read only"],
];
for(const [ok,label] of checks){if(!ok)throw new Error(`FAIL: ${label}`);console.log(`PASS: ${label}`)}
