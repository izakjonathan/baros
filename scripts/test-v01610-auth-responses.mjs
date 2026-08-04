import fs from 'node:fs';
const login=fs.readFileSync('app/api/auth/login/route.ts','utf8');
const logout=fs.readFileSync('app/api/auth/logout/route.ts','utf8');
const password=fs.readFileSync('lib/auth/password.ts','utf8');
for (const token of ['verifyPasswordOrDummy','requestId','cache-control','x-request-id']) if(!login.includes(token)) throw new Error(`login missing ${token}`);
for (const token of ['requestId','cache-control','x-request-id']) if(!logout.includes(token)) throw new Error(`logout missing ${token}`);
if(!password.includes('DUMMY_PASSWORD_HASH')) throw new Error('dummy hash missing');
console.log('v0.16.10 authentication response hardening passed');
