import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const pkg=JSON.parse(read('package.json'));
const manifest=read('app/manifest.ts');
const layout=read('app/layout.tsx');
const register=read('app/pwa-register.tsx');
const sw=read('public/sw.js');
const config=read('next.config.ts');

const checks=[
  [['0.10.4','0.10.5','0.10.6','0.11.0','0.11.1','0.11.2','0.11.3','0.11.4','0.11.6'].includes(pkg.version),'package version is PWA-compatible'],
  [manifest.includes('display: "standalone"'),'manifest uses standalone display'],
  [manifest.includes('icon-maskable-512.png'),'manifest includes maskable icon'],
  [layout.includes('appleWebApp'),'Apple standalone metadata exists'],
  [layout.includes('<PwaRegister />'),'service worker registration is mounted'],
  [register.includes('navigator.serviceWorker.register("/sw.js"'),'service worker registers at root scope'],
  [sw.includes('url.pathname.startsWith("/api/")'),'API requests are excluded from cache'],
  [sw.includes('request.mode === "navigate"'),'navigation uses network-first fallback'],
  [sw.includes('/offline.html'),'offline fallback is available'],
  [config.includes("worker-src 'self'"),'CSP permits same-origin service worker'],
  [config.includes('Service-Worker-Allowed'),'service-worker scope header exists'],
  [['public/icons/icon-192.png','public/icons/icon-512.png','public/icons/icon-maskable-512.png','public/icons/apple-touch-icon.png','public/offline.html'].every(p=>fs.existsSync(path.join(root,p))),'PWA assets exist'],
];
let failed=0;
for(const [ok,label] of checks){console.log(`${ok?'✓':'✗'} ${label}`); if(!ok) failed++;}
if(failed) process.exit(1);
