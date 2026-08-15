import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
assert.match(pkg.version,/^0\.19\.0-rc\.(?:2[89]|[3-9]\d|\d{3,})$/);
const layout=fs.readFileSync(path.join(root,"app/layout.tsx"),"utf8");
const tokens=fs.readFileSync(path.join(root,"styles/tokens.css"),"utf8");
assert.ok(!fs.existsSync(path.join(root,"app/mono-tokens.css")));
assert.doesNotMatch(layout,/mono-tokens\.css/);
for(const alias of ["--mono-canvas:var(--surface-page)","--app-header-height:66px","--workspace-card-padding:18px"]){assert.ok(tokens.includes(alias),`canonical token file missing ${alias}`);}
for(const dead of ["styles/layouts.css","styles/typography.css","styles/utilities.css"]){assert.ok(!fs.existsSync(path.join(root,dead)),`${dead} should remain removed`);}
const cssFiles=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,e.name);if(e.isDirectory()){if(!["node_modules",".next"].includes(e.name))walk(full);}else if(e.name.endsWith(".css"))cssFiles.push(full);}}walk(root);
let bytes=0,important=0;for(const file of cssFiles){const css=fs.readFileSync(file,"utf8");bytes+=Buffer.byteLength(css);important+=(css.match(/!important/g)||[]).length;}
assert.ok(cssFiles.length<=(pkg.version==="0.19.0-rc.28"?28:29),`CSS file budget exceeded: ${cssFiles.length}`);
assert.ok(bytes<231000,`CSS byte budget exceeded: ${bytes}`);
assert.ok(important<=20,`CSS !important budget exceeded: ${important}`);
const globals=fs.readFileSync(path.join(root,"app/globals.css"),"utf8");
for(const deadClass of [".attendance-table",".hours-by-employee",".inventory-toolbar",".settings-nav"]){assert.ok(!globals.includes(deadClass),`dead global selector returned: ${deadClass}`);}
console.log(`v0.19.0-rc.28 CSS token merge/global pruning passed (${cssFiles.length} files, ${bytes} bytes, ${important} !important)`);
