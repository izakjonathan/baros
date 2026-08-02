import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const shell=fs.readFileSync(path.join(root,'components/app-shell.tsx'),'utf8');
const app=fs.readFileSync(path.join(root,'components/bar-ops-app.tsx'),'utf8');
const css=fs.readFileSync(path.join(root,'app/design-system.css'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const checks=[
  [pkg.version==='0.11.5','package version'],
  [shell.includes('export function FloatingNavigation'),'floating navigation component'],
  [!shell.includes('export function Sidebar'),'legacy sidebar component removed'],
  [shell.includes('label: "Timesheets"'),'attendance renamed Timesheets'],
  [app.includes('<FloatingNavigation'),'manager uses floating navigation'],
  [!app.includes('<Sidebar'),'manager no longer renders sidebar'],
  [css.includes('.floating-navigation-toggle'),'fixed black toggle styles'],
  [css.includes('.floating-navigation-panel'),'expanding white panel styles'],
  [css.includes('overflow-y: auto'),'menu list scrolls vertically'],
  [css.includes('position: fixed'),'navigation stays fixed'],
];
for(const [ok,label] of checks){if(!ok) throw new Error(`v0.11.5 floating navigation failed: ${label}`); console.log(`✓ ${label}`)}
