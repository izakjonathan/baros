import fs from 'node:fs';

const component=fs.readFileSync('components/requests-workspace.tsx','utf8');
const css=fs.readFileSync('features/requests/RequestsWorkspace.module.css','utf8');
const globalCss=fs.readFileSync('app/mono-components.css','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

const checks=[
  [Number(pkg.version.split('.').at(-1))>=10,'package version retains v0.18.10 or later'],
  [component.includes('RequestsWorkspace.module.css'),'Requests uses a feature-owned CSS Module'],
  [component.includes("fetch('/api/requests'")&&component.includes("fetch('/api/shift-claims'")&&component.includes("fetch('/api/shift-transfers'"),'all request APIs are preserved'],
  [component.includes("method:'PATCH'")&&component.includes("'APPROVED'|'REJECTED'"),'approval and rejection behavior is preserved'],
  [component.includes('window.setInterval(refresh,15000)'),'live 15-second refresh is preserved'],
  [component.includes('Oldest requests appear first.'),'review priority is visible'],
  [component.includes('Queue is clear'),'compact empty state is present'],
  [css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'desktop request cards use shrinkable tracks'],
  [css.includes('@media(max-width:720px)')&&css.includes('.list{grid-template-columns:1fr}'),'mobile queue collapses to one column'],
  [css.includes('.actions{display:grid;grid-template-columns:1fr 1fr'),'review actions remain equally reachable'],
  [!globalCss.includes('.request-queue')&&!globalCss.includes('.queue-actions')&&!globalCss.includes('.queue-empty'),'legacy global request styling was removed'],
];
let failed=false;
for(const [ok,label] of checks){console.log(`${ok?'✓':'✗'} ${label}`);if(!ok)failed=true;}
if(failed)process.exit(1);
console.log('v0.18.10 Requests redesign regression passed');
