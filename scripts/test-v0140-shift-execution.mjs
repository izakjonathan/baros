import fs from "node:fs";
const app=fs.readFileSync("components/bar-ops-app.tsx","utf8"); const data=fs.readFileSync("lib/data.ts","utf8");
for(const token of ["Shift execution","Current shift board","Manage breaks","active === \"execution\""]) if(!app.includes(token)) throw new Error(`Missing ${token}`);
if(!data.includes('"execution"')) throw new Error("NavKey missing execution");
console.log("v0.14.0 shift execution checks passed");
