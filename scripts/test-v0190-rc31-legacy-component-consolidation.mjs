import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const files=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()){if(!['node_modules','.next'].includes(e.name))walk(p)}else if(e.name.endsWith('.css'))files.push(p)}}
for(const d of ['app','styles','features','components']) if(fs.existsSync(d)) walk(d);
const css=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');
const declarations=(css.match(/[-\w]+\s*:\s*[^;{}]+[;}]/g)||[]).length;
const important=(css.match(/!important/g)||[]).length;
if(declarations>5180) throw new Error(`CSS declaration budget exceeded: ${declarations}`);
if(important>10) throw new Error(`!important budget exceeded: ${important}`);
if(fs.existsSync('app/mono-components.css')) throw new Error('legacy mono-components.css returned');
console.log(`v0.19.0-rc.31 legacy component consolidation passed (${declarations} declarations, ${important} !important)`);
