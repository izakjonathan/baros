import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
const tokens=fs.readFileSync(path.join(root,"app/design-tokens.css"),"utf8");
const product=fs.readFileSync(path.join(root,"app/product-system.css"),"utf8");
const checks=[
  [pkg.version==="0.13.1","release version"],
  [tokens.includes("--floating-nav-bottom-browser: 2px"),"browser bottom token"],
  [tokens.includes("--floating-nav-bottom-standalone"),"standalone bottom token"],
  [product.includes("bottom: var(--floating-nav-bottom-browser)"),"floating nav uses one browser token"],
  [product.includes("bottom: var(--floating-nav-bottom-standalone)"),"standalone placement"],
  [!product.includes(".floating-navigation { position: fixed; z-index: 90; left: max(14px,env(safe-area-inset-left)); bottom: calc(14px + env(safe-area-inset-bottom))"),"old doubled safe-area placement removed"],
  [tokens.startsWith("/* Bar Ops design tokens"),"valid token stylesheet comment"],
  [!tokens.startsWith("/* Bar Ops design tokens — v0.13.1. Single semantic source of truth. */\n   This"),"no malformed comment tail"]
];
for(const [ok,label] of checks){if(!ok) throw new Error(label);}
console.log("v0.13.1 floating navigation placement checks passed");
