import fs from "node:fs";
const read=(p)=>fs.readFileSync(p,"utf8");
const pkg=JSON.parse(read("package.json"));
const layout=read("app/layout.tsx");
const tokens=read("app/design-tokens.css");
const system=read("app/design-system.css");
const feature=read("app/globals.css");
const checks=[
  [["0.10.6","0.11.0","0.11.1","0.11.2","0.11.3","0.11.4","0.11.6","0.11.8","0.11.9","0.12.0","0.12.1","0.12.2"].includes(pkg.version),"package version"],
  [layout.includes('import "./design-tokens.css"') && layout.includes('import "./design-system.css"'),"canonical design imports"],
  [!fs.existsSync("app/mono-tokens.css") && !fs.existsSync("app/mono-components.css"),"superseded design files removed"],
  [tokens.includes("--color-canvas") && tokens.includes("--control-height") && tokens.includes("--sidebar-width"),"central semantic tokens"],
  [!feature.includes(":root"),"feature CSS does not redefine root tokens"],
  [!feature.includes("!important") && !system.includes("!important"),"no cascade-forcing important rules"],
  [system.startsWith("/* Bar Ops design system"),"valid design-system header"],
  [!system.includes("--mono-focus"),"no undefined legacy focus token"],
  [system.includes("var(--control-height)") && system.includes("var(--radius-md)"),"components consume central tokens"],
];
for(const [ok,label] of checks){if(!ok)throw new Error(`Design-system check failed: ${label}`)}
console.log(`v0.10.6 design-system checks passed (${checks.length})`);
