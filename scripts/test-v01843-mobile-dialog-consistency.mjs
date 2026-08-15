import fs from "node:fs";
const app=fs.readFileSync("components/bar-ops-app.tsx","utf8");
const css=fs.readFileSync("app/mono-components.css","utf8");
const schedule=fs.readFileSync("features/scheduling/ScheduleWorkspace.module.css","utf8");
const dashboard=fs.readFileSync("features/dashboard/Dashboard.module.css","utf8");
const team=fs.readFileSync("features/employees/TeamWorkspace.module.css","utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const checks=[
 [pkg.version.startsWith("0.18.4.") && Number(pkg.version.split(".")[3]||0)>=3,"package version is v0.18.4.3 or newer"],
 [app.includes('className="employee-dialog"'),"employee dialog has dedicated mobile class"],
 [css.includes("grid-template-rows:auto minmax(0,1fr) auto"),"dialog uses fixed header/scroll body/actions layout"],
 [css.includes("env(safe-area-inset-bottom)"),"dialog and long screens preserve bottom safe area"],
 [css.includes(".execution-metrics{grid-template-columns:repeat(2"),"shift execution uses compact metric grid"],
 [schedule.includes("background:#f47add"),"scheduling uses approved pink shift identity"],
 [!schedule.includes("var(--shadow-sm)"),"schedule removes legacy shadows"],
 [dashboard.includes("operational-summary-grid>div:nth-child(odd)"),"operational summary avoids nested rounded cards"],
 [team.includes("stroke:currentColor"),"mobile add employee icon remains visible"],
];
for(const [ok,label] of checks){if(!ok){console.error(`FAIL: ${label}`);process.exitCode=1}else console.log(`PASS: ${label}`)}
