import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if(!/^0\.19\.0-rc\.(?:3[2-9]|[4-9]\d|\d{3,})$/.test(pkg.version)) throw new Error(`Expected rc.32 or later, got ${pkg.version}`);
const globals=fs.readFileSync(path.join(root,'app/globals.css'),'utf8');
const shell=fs.readFileSync(path.join(root,'components/shell/ManagerShell.module.css'),'utf8');
for(const selector of ['.sidebar{','.brand{','.side-nav ','.side-bottom','.profile{','.menu-button{','.location-switch','.top-actions']){
  if(globals.includes(selector)) throw new Error(`Legacy manager-shell selector remains in globals.css: ${selector}`);
}
if(fs.existsSync(path.join(root,'app/mono-components.css'))) throw new Error('Legacy mono-components.css returned');
for(const contract of ['position:fixed','width:246px','transform:translateX(-105%)',':global(.sidebar-open)','min-height:var(--mono-control)']){
  if(!shell.includes(contract)) throw new Error(`ManagerShell module missing contract: ${contract}`);
}
const cssRoots=['app','styles','features','components'];
let declarations=0, important=0, bytes=0;
for(const dir of cssRoots){
  const start=path.join(root,dir); if(!fs.existsSync(start)) continue;
  const stack=[start];
  while(stack.length){const current=stack.pop();for(const ent of fs.readdirSync(current,{withFileTypes:true})){const f=path.join(current,ent.name);if(ent.isDirectory())stack.push(f);else if(ent.name.endsWith('.css')){const text=fs.readFileSync(f,'utf8');bytes+=Buffer.byteLength(text);declarations+=(text.match(/(?:^|[;{])\s*[-\w]+\s*:/gm)||[]).length;important+=(text.match(/!important/g)||[]).length;}}}
}
if(declarations>5110) throw new Error(`CSS source declaration budget exceeded: ${declarations}`);
if(bytes>173000) throw new Error(`CSS byte budget exceeded: ${bytes}`);
if(important>10) throw new Error(`!important budget exceeded: ${important}`);
console.log(`v0.19.0-rc.32 manager shell single-owner consolidation passed (${declarations} declarations, ${bytes} bytes, ${important} !important)`);
