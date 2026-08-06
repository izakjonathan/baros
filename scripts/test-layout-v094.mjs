import fs from "node:fs";
const app=fs.readFileSync("components/bar-ops-app.tsx","utf8");
const css=["app/globals.css","app/mono-tokens.css","app/mono-components.css"].map((file)=>fs.readFileSync(file,"utf8")).join("\n");
const checks=[
 [app.includes('schedule-view-select') && app.includes('aria-label="Schedule view"') && app.includes('scheduleStyles.viewLabel'),"Schedule view is a compact accessible dropdown"],
 [!app.includes('className="view-toggle" aria-label="Schedule view"'),"Old three-button view toggle removed"],
 [app.includes('scheduleStyles.toolbar') && app.includes('viewMode === "custom" ? "has-custom-range" : ""'),"Custom range receives contained toolbar layout"],
 [/\.team-card\s+\.team-identity\s*\{[^}]*display\s*:\s*grid/s.test(css),"Employee identity is locked beside avatar"],
 [css.includes('.compact-schedule-toolbar.has-custom-range'),"Custom range responsive containment exists"]
];
for (const [ok,label] of checks){if(!ok){console.error(`FAIL: ${label}`);process.exit(1)}console.log(`PASS: ${label}`)}
