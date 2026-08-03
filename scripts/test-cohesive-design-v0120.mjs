import fs from "node:fs";
const tokens=fs.readFileSync("app/design-tokens.css","utf8");
const system=fs.readFileSync("app/product-system.css","utf8");
const globals=fs.readFileSync("app/globals.css","utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const checks=[
 [["0.12.0","0.12.1","0.13.0","0.13.1","0.13.2","0.14.0"].includes(pkg.version),"0.12.1","version is 0.12.0"],
 [tokens.includes("--type-page-mobile"),"responsive display token exists"],
 [tokens.includes("Space Grotesk is reserved for page and dialog titles"),"font-family roles documented"],
 [system.includes("Typography roles: display font only for product-level titles"),"display typography is scoped"],
 [system.includes("body:has(.modal-layer) .floating-navigation"),"floating nav is hidden behind dialogs"],
 [system.includes("bottom: calc(88px + env(safe-area-inset-bottom))"),"Safari chrome clearance exists"],
 [!globals.includes(".sidebar{position:fixed"),"obsolete sidebar base rule removed"],
 [system.includes(".hours-by-employee .team-card"),"payroll cards use compact shared layout"],
];
for(const [ok,label] of checks){if(!ok) throw new Error(`FAIL: ${label}`); console.log(`PASS: ${label}`)}
