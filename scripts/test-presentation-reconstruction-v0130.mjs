import fs from 'node:fs';
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const layout=fs.readFileSync('app/layout.tsx','utf8');
const tokens=fs.readFileSync('app/design-tokens.css','utf8');
const structural=fs.readFileSync('app/globals.css','utf8');
const product=fs.readFileSync('app/product-system.css','utf8');
const checks=[
 [['0.13.0','0.13.1','0.13.2'].includes(pkg.version),'0.13.1','version'],
 [layout.includes('./design-tokens.css')&&layout.includes('./globals.css')&&layout.includes('./product-system.css'),'stylesheet order'],
 [!fs.existsSync('app/design-system.css'),'old design stylesheet removed'],
 [product.includes('Bar Ops v0.13.2 canonical product interface'),'canonical presentation layer'],
 [product.includes('.employee-home-grid a > svg:first-child { color: var(--color-text); }'),'employee icons inherit canonical black'],
 [product.includes('.employee-home-grid a')&&product.includes('color: var(--color-text);'),'employee links cannot become browser blue'],
 [!structural.includes('#607338'),'legacy employee green removed'],
 [!structural.includes('.employee-nav'),'employee presentation removed from structural CSS'],
 [!structural.includes('.metric-card'),'metric presentation removed from structural CSS'],
 [!structural.includes('.modal-layer'),'modal presentation removed from structural CSS'],
 [tokens.includes('--font-display')&&tokens.includes('--font-body'),'central font roles'],
 [!product.includes('!important')&&!structural.includes('!important'),'no cascade forcing'],
];
for(const [ok,name] of checks){if(!ok) throw new Error(`Presentation reconstruction check failed: ${name}`)}
console.log('v0.13.0 presentation reconstruction checks passed');
