import fs from "node:fs";
function read(path){return fs.readFileSync(path,"utf8")}
const layout=read("app/layout.tsx");
const shared=read("app/shared-controls.css");
const visual=read("app/visual-qa-consistency.css");
const accessibility=read("app/accessibility-interaction.css");
if(!layout.includes('import "./shared-controls.css"')) throw new Error("shared-controls.css is not imported");
if(layout.includes("button-alignment-corrections.css")) throw new Error("superseded button correction layer remains imported");
for(const token of ["align-items:center","justify-content:center","focus-visible","aria-busy","disabled"]){if(!shared.includes(token)) throw new Error(`shared control contract missing ${token}`)}
if((visual.match(/focus-visible/g)||[]).length) throw new Error("visual QA layer still owns focus-visible");
if((accessibility.match(/focus-visible/g)||[]).length) throw new Error("accessibility layer duplicates focus-visible owner");
if(!read("docs/CSS_OWNERSHIP.md").includes("Shift Plan toolbar and mobile track ownership were consolidated in rc.7")) throw new Error("CSS ownership boundary is not documented");
console.log("v0.19.0-rc.6 CSS ownership regression passed");
