import fs from 'node:fs';
const session=fs.readFileSync('lib/auth/session.ts','utf8');
for (const token of ['sql.begin','expires_at <= now()','offset 10']) if(!session.includes(token)) throw new Error(`session hygiene missing ${token}`);
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
if(!/^0\.16\.(?:1[1-9]|[2-9]\d)(?:\.\d+)?$/.test(pkg.version)) throw new Error(`unexpected version ${pkg.version}`);
console.log('v0.16.11 session store hygiene passed');
