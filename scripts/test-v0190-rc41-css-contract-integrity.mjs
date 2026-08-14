import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const pkg=JSON.parse(read('package.json'));
const global=read('app/globals.css');
const tokens=read('styles/tokens.css');
const schedule=read('features/scheduling/ScheduleWorkspace.module.css');
const dialog=read('components/ui/interaction-ui.tsx');
const chrome=read('components/shell/workspace-chrome.tsx');
const layout=read('app/layout.tsx');
const employeeShell=read('app/employee/employee-shell.tsx');
const managerApp=read('components/bar-ops-app.tsx');
const uiClasses=read('lib/ui-classes.ts');
const exceptionRegister=read('docs/constitution/INTENTIONAL_EXCEPTION_REGISTER.md');
const css=walk(root).filter(p=>p.endsWith('.css')&&!p.includes('/node_modules/')&&!p.includes('/.next/'));
const rel=css.map(p=>path.relative(root,p)).sort();
const classSelectors=new Set([...global.matchAll(/\.([A-Za-z_][\w-]*)/g)].map(m=>m[1]));
for(const m of schedule.matchAll(/\.([A-Za-z_][\w-]*)/g)) classSelectors.add(m[1]);
const mappedClasses=[...uiClasses.matchAll(/:\s*"([^"]+)"/g)].flatMap(m=>m[1].split(/\s+/)).filter(Boolean);
const missingMapped=[...new Set(mappedClasses.filter(name=>!classSelectors.has(name)))];
const checks=[
 ['version is rc.41 or later',/^0\.19\.0-rc\.(?:4[1-9]|[5-9]\d|\d{3,})$/.test(pkg.version)],
 ['only three CSS files remain',JSON.stringify(rel)===JSON.stringify(['app/globals.css','features/scheduling/ScheduleWorkspace.module.css','styles/tokens.css'])],
 ['page wrap owns safe area and mobile gutter',global.includes('--mobile-gutter')&&global.includes('padding-left:max(var(--mobile-gutter),env(safe-area-inset-left))')&&global.includes('padding-bottom:calc(5.5rem + env(safe-area-inset-bottom))')],
 ['employee page does not own outer padding',!/\.employee-page\{[^}]*padding/i.test(global)&&!/\.employee-page\{[^}]*margin/i.test(global)],
 ['employee page uses shared flow gap',/\.employee-page\{[^}]*gap:var\(--gap\)/.test(global)],
 ['topbar uses same mobile gutter',/\.topbar\{[^}]*padding-left:max\(var\(--mobile-gutter\),env\(safe-area-inset-left\)\)/.test(global)],
 ['heading and paragraph margins are fully reset',global.includes('h1,h2,h3,p{margin:0}')],
 ['bold token matches loaded font',tokens.includes('--weight-bold:700;')],
 ['native light-surface controls request light scheme',global.includes('input,select,textarea{color-scheme:light}')],
 ['theme toggle removed until a real light theme exists',!chrome.includes('onToggleTheme')&&!managerApp.includes('bar-ops-theme')&&!employeeShell.includes('bar-ops-theme')&&!layout.includes('data-theme')],
 ['shared state components are styled',global.includes('.shared-empty-state{')&&global.includes('.shared-state-card{')&&global.includes('.shared-spinner{')&&global.includes('.shared-error-state{')],
 ['Dialog renders a shared modal body',dialog.includes('<div className="modal-body">{children}</div>')&&global.includes('.modal-body{')],
 ['all ui class map contracts resolve to CSS',missingMapped.length===0],
 ['Shift Plan editor styling is module-owned',schedule.includes('.assignmentToggle{')&&schedule.includes('.shiftDialogFields{')&&schedule.includes('.repeatPanel{')&&schedule.includes('.editShiftActions{')&&!managerApp.includes('className="assignment-toggle"')],
 ['employee transfer uses shared segmented/form primitives',read('app/employee/shifts/shift-actions.tsx').includes('className="segmented-control"')&&global.includes('.form-stack,.transfer-dialog{')],
 ['schedule acknowledgement uses real button primitive',read('app/employee/shifts/schedule-acknowledgement.tsx').includes('className="primary"')&&!read('app/employee/shifts/schedule-acknowledgement.tsx').includes('portal-action')],
 ['manager PageHeader is backed by WorkspaceHeader',managerApp.includes('return <WorkspaceHeader eyebrow={eyebrow} title={title} description={subtitle} actions={action}/>;')],
 ['root global-error inline styling is documented exception',exceptionRegister.includes('global-error.tsx')&&exceptionRegister.includes('root error boundary')],
];
let failed=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`); if(!ok) failed++;}
if(missingMapped.length) console.log('Missing mapped classes:',missingMapped.join(', '));
if(failed) process.exit(1);
console.log(`CSS files: ${rel.length}`);
