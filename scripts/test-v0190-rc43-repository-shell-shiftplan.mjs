import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const pkg=JSON.parse(read("package.json"));
const css=read("app/globals.css");
const schedule=read("features/scheduling/ScheduleWorkspace.module.css");
const quality=read(".github/workflows/quality.yml");
const scriptFiles=fs.readdirSync(path.join(root,"scripts")).filter(f=>f.endsWith(".mjs"));
const checks=[
 ["version is rc.43",pkg.version==="0.19.0-rc.43"],
 ["active npm script surface is compact",Object.keys(pkg.scripts).length<=26],
 ["historical test command removed",!("test:historical" in pkg.scripts)],
 ["generated tsbuildinfo is not shipped",!fs.existsSync(path.join(root,"tsconfig.tsbuildinfo"))],
 ["active scripts directory is compact",scriptFiles.length<=30],
 ["quality workflow runs current suite only",quality.includes("npm run test:all")&&!quality.includes("test:v0190rc3")&&!quality.includes("test:v01816-acceptance")],
 ["topbar is globally fixed",/\.topbar\{position:fixed;top:0;/.test(css)],
 ["mobile topbar does not become sticky",!css.includes(".topbar{position:sticky")],
 ["main shell always reserves fixed topbar",/\.main-shell\{[^}]*padding-top:calc\(var\(--topbar-h\) \+ env\(safe-area-inset-top\)\)/.test(css)],
 ["mobile shell keeps fixed topbar clearance",css.includes(".main-shell{margin-left:0;padding-top:calc(var(--topbar-h) + env(safe-area-inset-top))}")],
 ["shift plan workspace clips page-level inline overflow",/\.workspace\{[^}]*overflow-x:clip/.test(schedule)],
 ["shift plan panel is viewport-contained",/\.calendarPanel\{[^}]*width:100%;max-width:100%;min-width:0;overflow:hidden/.test(schedule)],
 ["only day scroller owns horizontal scrolling",/\.calendarScroll\{[^}]*width:100%;max-width:100%;min-width:0;overflow-x:auto/.test(schedule)],
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?"PASS":"FAIL"} ${name}`);if(!ok)failed++;}
if(failed)process.exit(1);
console.log(`Active scripts: ${scriptFiles.length}; npm commands: ${Object.keys(pkg.scripts).length}`);
