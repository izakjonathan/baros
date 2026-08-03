import fs from "node:fs";
const app=fs.readFileSync("components/bar-ops-app.tsx","utf8");
const ui=fs.readFileSync("components/ui-primitives.tsx","utf8");
const dash=fs.readFileSync("features/overview/dashboard.tsx","utf8");
const checks=[
  [ui.includes("export function PanelTitle"),"PanelTitle is exported from shared primitives"],
  [app.includes("KpiCard, PanelTitle"),"manager app imports shared PanelTitle"],
  [dash.includes("KpiCard, PanelTitle"),"dashboard imports shared PanelTitle"],
  [!dash.includes("function PanelTitle("),"duplicate dashboard PanelTitle removed"],
  [!app.includes("<Metric "),"legacy Metric references removed from manager app"],
];
for(const [ok,label] of checks){if(!ok)throw new Error(`v0.11.4 build-symbol check failed: ${label}`); console.log(`✓ ${label}`)}
