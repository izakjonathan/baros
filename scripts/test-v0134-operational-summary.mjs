import fs from "node:fs";
const src=fs.readFileSync("components/bar-ops-app.tsx","utf8");
for(const token of ["Operational summary","workedMinutesToday","completedTasks","operationalExceptions"]) if(!src.includes(token)) throw new Error(`Missing ${token}`);
console.log("v0.13.4 operational summary checks passed");
