import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');
const pkg=JSON.parse(read('package.json'));
const css=read('app/mono-components.css');
const sw=read('public/sw.js');
const checks=[
  [pkg.version.localeCompare('0.15.3', undefined, {numeric:true})>=0,'package version is v0.15.3 or newer'],
  [!fs.existsSync('public/offline.html'),'problematic public/offline.html is removed'],
  [sw.includes('const OFFLINE_HTML') && sw.includes('new Response(OFFLINE_HTML'),'offline fallback is self-contained in service worker'],
  [sw.includes('bar-ops-v0153'),'service worker cache version is refreshed'],
  [css.includes('/* v0.15.3 — mobile and iPad polish */'),'mobile/iPad release styles exist'],
  [css.includes('(hover:none) and (pointer:coarse)'),'coarse-pointer touch targets are covered'],
  [css.includes('(min-width:768px) and (max-width:1180px)'),'iPad breakpoint is covered'],
  [css.includes('env(safe-area-inset-left)'),'safe-area insets are covered'],
  [!fs.existsSync('vercel.json'),'vercel.json remains absent'],
];
let failed=0;
for(const [ok,label] of checks){console.log(`${ok?'✓':'✗'} ${label}`);if(!ok)failed++;}
if(failed)process.exit(1);
