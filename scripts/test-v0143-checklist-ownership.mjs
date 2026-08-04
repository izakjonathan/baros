import fs from "node:fs";
const route=fs.readFileSync("app/api/operation-checklists/route.ts","utf8");const ui=fs.readFileSync("components/bar-ops-app.tsx","utf8");
for(const [ok,label] of [[route.includes("ownerLabel")&&route.includes("dueLabel"),"API stores responsibility"],[ui.includes("editTaskMeta")&&ui.includes("Task responsibility updated"),"manager can edit responsibility"]]){if(!ok)throw new Error(`FAIL: ${label}`);console.log(`PASS: ${label}`)}
