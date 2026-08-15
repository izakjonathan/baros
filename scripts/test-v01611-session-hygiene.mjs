import fs from 'node:fs';
const session=fs.readFileSync('lib/auth/session.ts','utf8');
const store=fs.readFileSync('lib/auth/session-store.ts','utf8');
if(!session.includes('sql.begin')) throw new Error('session hygiene missing sql.begin');
for (const token of ['expires_at <= now()','offset ${retain}']) if(!store.includes(token)) throw new Error(`session hygiene missing ${token}`);
console.log('v0.16.11 session store hygiene passed');
