import fs from "node:fs";
const css=["app/globals.css","app/mono-tokens.css","app/mono-components.css"].map((file)=>fs.readFileSync(file,"utf8")).join("\n");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const checks=[
 ["version",["0.9.7","0.9.8","0.9.9","0.10.0","0.10.1","0.10.2","0.10.3","0.10.4","0.10.5","0.10.6","0.10.7","0.10.8","0.10.9","0.10.10","0.10.11","0.11.0"].includes(pkg.version)],
 ["light grey canvas",css.includes("--mono-canvas: #f4f4f2")],
 ["black icon stroke",css.includes(":where(.lucide")&&css.includes("stroke: currentColor")],
 ["transparent icon buttons",/\.icon-button[^}]*background\s*:\s*transparent/s.test(css)],
 ["flat cards",/\.metric-card[^}]*border\s*:\s*0/s.test(css)],
 ["equal action height",css.includes("min-height: 42px")&&css.includes(".modal-actions > button")],
 ["tonal inputs",css.includes("background: var(--mono-inset)")],
 ["subtle data rules",css.includes("rgba(17,17,17,.055)")||css.includes("rgba(17, 17, 17, .055)")],
];
for(const [name,ok] of checks){if(!ok) throw new Error(`minimal flat check failed: ${name}`)}
console.log(`minimal flat checks passed (${checks.length})`);
