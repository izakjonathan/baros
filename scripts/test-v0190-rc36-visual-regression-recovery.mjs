import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root=process.cwd();
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if(pkg.version!=='0.19.0-rc.36') throw new Error(`Expected rc.36, got ${pkg.version}`);
const expected={
'components/shell/ManagerShell.module.css':'a162746a2457494f62921c57c5796db2b70c477b708e284fcbeb9d23de39ce47',
'features/attendance/AttendanceWorkspace.module.css':'529ec2e7882934b609868aa727f0e065d2da4f3b103b0890c3a02f46d6e04d1a',
'features/operations/DailyOperations.module.css':'764fc6f83586f279cb32ba6d7643c441fb80490b68da8017d238f030be483a92',
'features/inventory/InventoryWorkspace.module.css':'1e9b7150de71feaec521a6dfc4e6f79d683ba4d289de1b5d21552e4b26112c4c',
'features/dashboard/Dashboard.module.css':'acb63365893851c1ccff69e7c146ff6e80108c62938e37ca69c848770e3ac938',
'features/requests/RequestsWorkspace.module.css':'955e79fd6bd313cbc09e6055df604deeb44a24b67e082748bde8aac61ef29e82',
'features/orders/OrdersWorkspace.module.css':'de78e8d75e8c0005468554b37233ad4dd8c364d7e64043102331e880d9dd2edf',
'features/scheduling/ScheduleWorkspace.module.css':'177e1b53c7daffa79e51a1d10c1c5946af3eb33e8b3de61993eb79b77eb77f72',
'styles/tokens.css':'35f1ee65baac9c59daa312c6f88623fb8489fa4bafa3f642582c5ce58e54e63e',
'app/completion-redesign.css':'b2dbe1f4b04499bf319b2835c5b566b61410fca4c2d6bc0a4aea6ac3e8ef8565',
'app/employee/EmployeeWorkspace.css':'9a41cd7abd446b39e6a63d1eb10d7894cd5a65a3915bc3ed82e5026e15da19eb'};
for(const [file,hash] of Object.entries(expected)){
 const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
 if(actual!==hash) throw new Error(`Recovered CSS drifted: ${file}`);
}
const py=`from pathlib import Path\nimport tinycss2\nd=r=b=i=f=0\ndef w(ns):\n global d,r\n for x in ns:\n  if x.type=='qualified-rule': d+=sum(y.type=='declaration' for y in tinycss2.parse_declaration_list(x.content,skip_comments=True,skip_whitespace=True));r+=1\n  elif x.type=='at-rule' and x.content is not None:\n   try:w(tinycss2.parse_rule_list(x.content,skip_comments=True,skip_whitespace=True))\n   except:pass\nfor p in Path('.').rglob('*.css'):\n if 'node_modules' in p.parts or '.next' in p.parts:continue\n t=p.read_text(errors='ignore');f+=1;b+=len(t.encode());i+=t.count('!important');sheet=tinycss2.parse_stylesheet(t,skip_comments=True,skip_whitespace=True);assert not any(x.type=='error' for x in sheet),p;w(sheet)\nprint(f,d,r,b,i)`;
const metrics=execFileSync('python',['-c',py],{cwd:root,encoding:'utf8'}).trim();
if(metrics!=='25 4135 1397 141171 9') throw new Error(`Unexpected recovered CSS metrics: ${metrics}`);
console.log(`rc.36 visual regression recovery checks passed (${metrics}).`);
