import fs from 'node:fs';
const app=fs.readFileSync('components/bar-ops-app.tsx','utf8');
const css=fs.readFileSync('app/mono-components.css','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const failures=[];
for (const token of ['Search team','Search inventory','Search orders','result-count','Clear filters']) if(!app.includes(token)) failures.push(`Missing ${token}`);
if(!css.includes('v0.15.2 — search and productivity')) failures.push('Missing v0.15.2 CSS');
if(!/^0\.15\.(?:[2-9]|\d{2,})$/.test(pkg.version)) failures.push('Package version does not preserve the v0.15.2+ baseline');
if(fs.existsSync('vercel.json')) failures.push('Unnecessary vercel.json must not be present');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('v0.15.2 search/productivity and Vercel configuration checks passed');
