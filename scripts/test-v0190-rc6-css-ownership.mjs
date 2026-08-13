import fs from "node:fs";
function read(path){return fs.readFileSync(path,"utf8")}
const layout=read("app/layout.tsx");
const shared=read("app/system-contracts.css");
const visual=shared;
const accessibility=shared;
if(!layout.includes('import "./system-contracts.css"')) throw new Error("system-contracts.css is not imported");
if(layout.includes("button-alignment-corrections.css")) throw new Error("superseded button correction layer remains imported");
for(const token of ["align-items:center","justify-content:center","focus-visible","aria-busy","disabled"]){if(!shared.includes(token)) throw new Error(`shared control contract missing ${token}`)}
if((shared.match(/focus-visible/g)||[]).length < 1) throw new Error("consolidated system contract is missing focus-visible ownership");
if(!read("docs/CSS_OWNERSHIP.md").includes("Shift Plan toolbar and mobile track ownership were consolidated in rc.7")) throw new Error("CSS ownership boundary is not documented");
console.log("v0.19.0-rc.6 CSS ownership regression passed");
