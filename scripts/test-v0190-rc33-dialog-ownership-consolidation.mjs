import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if(!/^0\.19\.0-rc\.(?:3[3-9]|[4-9]\d|\d{3,})$/.test(pkg.version)) throw new Error(`Expected rc.33 or later, got ${pkg.version}`);
const app=fs.readFileSync(path.join(root,'components/bar-ops-app.tsx'),'utf8');
const schedule=fs.readFileSync(path.join(root,'features/scheduling/ScheduleWorkspace.module.css'),'utf8');
if(fs.existsSync(path.join(root,'app/mono-components.css'))) throw new Error('Legacy dialog owner mono-components.css returned');
if(app.includes('className="employee-dialog"')) throw new Error('Employee editor still depends on the legacy employee-dialog class');
if(!app.includes('className={scheduleStyles.shiftEditorDialog}')) throw new Error('Shift editor is not owned by the Schedule CSS Module');
for(const contract of ['.shiftEditorDialog{','.shiftEditorBody{',':global(.assignment-toggle)',':global(.weekday-picker)',':global(.edit-shift-actions)']){
  if(!schedule.includes(contract)) throw new Error(`Scoped shift editor contract missing: ${contract}`);
}
const cssRoots=['app','styles','features','components'];
let declarations=0, important=0, bytes=0;
for(const dir of cssRoots){
  const start=path.join(root,dir); if(!fs.existsSync(start)) continue;
  const stack=[start];
  while(stack.length){const current=stack.pop();for(const ent of fs.readdirSync(current,{withFileTypes:true})){const f=path.join(current,ent.name);if(ent.isDirectory())stack.push(f);else if(ent.name.endsWith('.css')){const text=fs.readFileSync(f,'utf8');bytes+=Buffer.byteLength(text);declarations+=(text.match(/(?:^|[;{])\s*[-\w]+\s*:/gm)||[]).length;important+=(text.match(/!important/g)||[]).length;}}}
}
if(declarations>4950) throw new Error(`CSS source declaration budget exceeded: ${declarations}`);
if(bytes>168000) throw new Error(`CSS byte budget exceeded: ${bytes}`);
if(important>10) throw new Error(`!important budget exceeded: ${important}`);
console.log(`v0.19.0-rc.33 dialog ownership consolidation passed (${declarations} declarations, ${bytes} bytes, ${important} !important)`);
