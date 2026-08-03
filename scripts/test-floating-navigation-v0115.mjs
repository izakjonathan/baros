import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const shell=fs.readFileSync(path.join(root,'components/app-shell.tsx'),'utf8');
const app=fs.readFileSync(path.join(root,'components/bar-ops-app.tsx'),'utf8');
const css=fs.readFileSync(path.join(root,'app/product-system.css'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const checks=[
  [['0.11.6','0.11.7','0.11.8','0.11.9','0.12.0','0.12.1','0.13.0','0.13.1','0.13.2','0.14.0'].includes(pkg.version),'package version'],
  [shell.includes('export function FloatingNavigation'),'floating navigation component'],
  [!shell.includes('export function Sidebar'),'legacy sidebar component removed'],
  [shell.includes('label: "Timesheets"'),'attendance renamed Timesheets'],
  [app.includes('<FloatingNavigation'),'manager uses floating navigation'],
  [!app.includes('<Sidebar'),'manager no longer renders sidebar'],
  [css.includes('.floating-navigation-toggle'),'fixed black toggle styles'],
  [css.includes('.floating-navigation-shell'),'expanding pill shell styles'],
  [css.includes('.floating-navigation-strip'),'horizontal menu strip styles'],
  [!shell.includes('floating-navigation-profile'),'large profile block removed'],
  [css.includes('overflow-x: auto'),'menu strip scrolls horizontally'],
  [css.includes('position: fixed'),'navigation stays fixed'],
];
for(const [ok,label] of checks){if(!ok) throw new Error(`floating navigation regression failed: ${label}`); console.log(`✓ ${label}`)}
