import fs from "node:fs";
const css=["app/globals.css","app/mono-tokens.css","app/mono-components.css"].map((file)=>fs.readFileSync(file,"utf8")).join("\n");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const checks=[
  [["0.9.6","0.9.7","0.9.8","0.9.9","0.10.0","0.10.1","0.10.2","0.10.3","0.10.4","0.10.5","0.10.6","0.10.7","0.10.8","0.10.9","0.10.10","0.10.11"].includes(pkg.version),"package version"],
  [/\.topbar\s*,\s*\.employee-header\s*\{[^}]*border\s*:\s*0/s.test(css),"topbar divider removed"],
  [/\.icon-button[^}]*background\s*:\s*transparent/s.test(css),"top navigation actions are icon-only"],
  [/\.metric-card[^}]*border\s*:\s*0/s.test(css),"cards use borderless surfaces"],
  [/\.employee-header[^}]*border\s*:\s*0/s.test(css),"employee header divider removed"],
  [/\.employee-nav[^}]*border\s*:\s*0/s.test(css),"employee navigation divider removed"],
  [/\.secondary:hover[^}]*background\s*:\s*rgba\(17,17,17,\.055\)/s.test(css),"same-surface control affordances retained"],
];
for(const [ok,label] of checks){if(!ok){console.error(`FAIL ${label}`);process.exit(1)}console.log(`PASS ${label}`)}
