import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const root=process.cwd();
const pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
assert.match(pkg.version,/^0\.19\.0-rc\.(?:29|[3-9]\d|\d{3,})$/);
const layout=fs.readFileSync(path.join(root,"app/layout.tsx"),"utf8");
assert.match(layout,/design-system\.css/);
const app=fs.readFileSync(path.join(root,"components/bar-ops-app.tsx"),"utf8");
const requests=fs.readFileSync(path.join(root,"components/requests-workspace.tsx"),"utf8");
for(const source of [app,requests]) assert.match(source,/FeatureSurface\.module\.css/);
for(const dead of ["schedule-head","schedule-head-actions","compact-schedule-toolbar","schedule-view-select","schedule-calendar","calendar-grid","day-column","day-header","day-body","shift-card-button","add-slot"]){
  assert.ok(!app.includes(`className=\"${dead}`) && !app.includes(` ${dead}`),`manager Schedule still depends on legacy global class ${dead}`);
}
const globalCss=fs.readFileSync(path.join(root,"app/globals.css"),"utf8");
for(const dead of [".schedule-head",".compact-schedule-toolbar",".schedule-view-select",".schedule-calendar",".calendar-grid",".day-column",".day-header",".day-body",".shift-card-button",".add-slot"]){assert.ok(!globalCss.includes(dead),`legacy global Schedule selector returned: ${dead}`);}
const cssFiles=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,e.name);if(e.isDirectory()){if(!["node_modules",".next"].includes(e.name))walk(full);}else if(e.name.endsWith(".css"))cssFiles.push(full);}}walk(root);
let declarations=0,bytes=0,important=0;
for(const file of cssFiles){const css=fs.readFileSync(file,"utf8");bytes+=Buffer.byteLength(css);important+=(css.match(/!important/g)||[]).length;declarations+=(css.match(/(?:^|[;{])\s*--?[\w-]+\s*:/gm)||[]).length;}
assert.ok(cssFiles.length<=29,`CSS file budget exceeded: ${cssFiles.length}`);
assert.ok(bytes<207000,`CSS byte budget exceeded: ${bytes}`);
assert.ok(important<=20,`CSS !important budget exceeded: ${important}`);
// Declaration budget is independently verified by the structural parser in this test.
const py=`from pathlib import Path\nimport tinycss2\nd=0\nfor p in Path('.').rglob('*.css'):\n t=p.read_text(errors='ignore')\n def w(ns):\n  global d\n  for x in ns:\n   if x.type=='qualified-rule':\n    d+=sum(y.type=='declaration' for y in tinycss2.parse_declaration_list(x.content,skip_comments=True,skip_whitespace=True))\n   elif x.type=='at-rule' and x.content is not None:w(tinycss2.parse_rule_list(x.content,skip_comments=True,skip_whitespace=True))\n w(tinycss2.parse_stylesheet(t,skip_comments=True,skip_whitespace=True))\nprint(d)`;
const parsed=Number(execFileSync("python",["-c",py],{cwd:root,encoding:"utf8"}).trim());
assert.ok(parsed<6000,`CSS declaration budget exceeded: ${parsed}`);
console.log(`v0.19.0-rc.29 CSS primitive consolidation passed (${cssFiles.length} files, ${parsed} declarations, ${bytes} bytes, ${important} !important)`);
