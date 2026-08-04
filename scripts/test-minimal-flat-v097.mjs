import { isVersionAtLeast } from "./version-utils.mjs";
import fs from "node:fs";
const css=["app/globals.css","app/mono-tokens.css","app/mono-components.css"].map((file)=>fs.readFileSync(file,"utf8")).join("\n");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const checks=[
 ["version",isVersionAtLeast(pkg.version, "0.9.7")],
 ["approved flat canvas",css.includes("--mono-canvas: #fff4c4")],
 ["black icon stroke",css.includes(":where(.lucide")&&css.includes("stroke: currentColor")],
 ["transparent icon buttons",/\.icon-button[^}]*background\s*:\s*transparent/s.test(css)],
 ["flat cards",/\.metric-card[^}]*border\s*:\s*0/s.test(css)],
 ["equal action height",css.includes("min-height: 42px")&&css.includes(".modal-actions > button")],
 ["tonal inputs",css.includes("background: var(--mono-inset)")],
 ["subtle data rules",css.includes("rgba(17,17,17,.055)")||css.includes("rgba(17, 17, 17, .055)")],
];
for(const [name,ok] of checks){if(!ok) throw new Error(`minimal flat check failed: ${name}`)}
console.log(`minimal flat checks passed (${checks.length})`);
