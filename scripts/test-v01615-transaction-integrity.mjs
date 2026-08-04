import fs from 'node:fs';
const orders=fs.readFileSync('app/api/orders/route.ts','utf8');
const payroll=fs.readFileSync('app/api/payroll-periods/route.ts','utf8');
for(const [name,src] of [['orders',orders],['payroll',payroll]]) {
 if(!src.includes('db().begin')) throw new Error(`${name} mutation is not transactional`);
 if(!src.includes('insert into audit_logs')) throw new Error(`${name} audit is not written in route transaction`);
}
if(orders.includes('writeAudit(')||payroll.includes('writeAudit(')) throw new Error('audit write remains outside transaction');
console.log('v0.16.15 transaction integrity checks passed');
