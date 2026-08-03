import fs from "node:fs";
const app=fs.readFileSync("components/bar-ops-app.tsx","utf8");
const css=fs.readFileSync("app/globals.css","utf8");
const checks=[
 [app.includes('className="schedule-view-select"'),"Schedule view is a compact dropdown"],
 [!app.includes('className="view-toggle" aria-label="Schedule view"'),"Old three-button view toggle removed"],
 [app.includes('className={`schedule-toolbar compact-schedule-toolbar ${viewMode === "custom" ? "has-custom-range" : ""}`}'),"Custom range receives contained toolbar layout"],
 [/\.team-card \.team-identity\s*\{[^}]*display\s*:\s*grid/.test(css),"Employee identity is locked beside avatar"],
 [css.includes('.compact-schedule-toolbar.has-custom-range'),"Custom range responsive containment exists"]
];
for (const [ok,label] of checks){if(!ok){console.error(`FAIL: ${label}`);process.exit(1)}console.log(`PASS: ${label}`)}
