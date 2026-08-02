import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');
const pkg=JSON.parse(read('package.json'));
const layout=read('app/layout.tsx');
const tokens=read('app/design-tokens.css');
const system=read('app/design-system.css');
const structural=read('app/globals.css');
const checks=[
  [pkg.version==='0.12.1','release version'],
  [layout.indexOf('./design-tokens.css') < layout.indexOf('./globals.css') && layout.indexOf('./globals.css') < layout.indexOf('./design-system.css'),'stylesheet load order'],
  [!tokens.includes('--mono-'),'obsolete Mono aliases removed'],
  [!system.includes('!important') && !structural.includes('!important'),'no cascade-forcing declarations'],
  [system.includes('All visual rules consume design-tokens.css'),'canonical design-system header'],
  [tokens.includes('--font-display') && tokens.includes('--font-body'),'central font roles'],
  [tokens.includes('--space-page') && tokens.includes('--control-height'),'central layout tokens'],
];
for(const [ok,label] of checks){if(!ok) throw new Error(`Design integrity failed: ${label}`)}
console.log('v0.12.1 design integrity checks passed');
