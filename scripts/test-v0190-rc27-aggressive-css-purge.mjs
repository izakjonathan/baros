import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
assert.match(pkg.version,/^0\.19\.0-rc\.(?:2[7-9]|[3-9]\d|\d{3,})$/);
const cssFiles=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory()){if(!["node_modules",".next"].includes(entry.name))walk(full);}else if(entry.name.endsWith(".css"))cssFiles.push(full);}}
walk(root);
let bytes=0, important=0;
for(const file of cssFiles){const css=fs.readFileSync(file,"utf8");bytes+=Buffer.byteLength(css);important+=(css.match(/!important/g)||[]).length;}
const schedule=fs.readFileSync(path.join(root,"features/scheduling/ScheduleWorkspace.module.css"),"utf8");
assert.equal((schedule.match(/!important/g)||[]).length,0,"Schedule must not reintroduce legacy !important flags");
assert.ok(important<=20,`CSS !important budget exceeded: ${important}`);
assert.ok(bytes<260000,`CSS byte budget exceeded: ${bytes}`);
assert.ok(schedule.length<30000,`Schedule CSS should remain aggressively consolidated: ${schedule.length}`);
for(const dead of [".schedule-toolbar",".schedule-calendar",".week-view",".month-view",".execution-list",".live-board-row"]){assert.ok(!schedule.includes(dead),`Dead Schedule selector returned: ${dead}`);}
console.log(`v0.19.0-rc.27 aggressive CSS purge passed (${bytes} CSS bytes, ${important} !important declarations)`);
