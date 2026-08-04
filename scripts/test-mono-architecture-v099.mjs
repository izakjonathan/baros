import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');
const tokens=read('app/mono-tokens.css');
const components=read('app/mono-components.css');
const layout=read('app/layout.tsx');
const pkg=JSON.parse(read('package.json'));
const checks=[
 ['version 0.9.9+',['0.9.9','0.10.0','0.10.1','0.10.2','0.10.3','0.10.4','0.10.5','0.10.6','0.10.7','0.10.8','0.10.9','0.10.10','0.10.11','0.11.0','0.11.1','0.11.2','0.11.3','0.11.4','0.11.6','0.12.0','0.12.1','0.12.2','0.12.3','0.12.4','0.13.0','0.13.1','0.13.2','0.13.3','0.13.4','0.14.0','0.14.1','0.14.2'].includes(pkg.version)],
 ['mono tokens loaded',layout.includes('mono-tokens.css')],
 ['mono components loaded',layout.includes('mono-components.css')],
 ['legacy mono override removed',!fs.existsSync('app/mono.css')],
 ['no important declarations in mono components',!components.includes('!important')],
 ['no global svg mutation',!/\nsvg\s*\{/.test(components)],
 ['lucide icon scope',components.includes(':where(.lucide')],
 ['44px control token',tokens.includes('--mono-control: 44px')],
 ['selected assignment state',components.includes('.assignment-toggle button.selected')],
 ['disabled state',components.includes('button:disabled')],
 ['quality workflow restored',fs.existsSync('.github/workflows/quality.yml')],
 ['database workflow restored',fs.existsSync('.github/workflows/database-admin.yml')],
];
for(const [name,ok] of checks){if(!ok){console.error('FAIL',name);process.exitCode=1}else console.log('PASS',name)}
if(process.exitCode)process.exit(process.exitCode);
