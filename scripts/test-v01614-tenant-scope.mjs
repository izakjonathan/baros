import fs from 'node:fs';
const scope=fs.readFileSync('lib/auth/scope.ts','utf8');
const orders=fs.readFileSync('app/api/orders/route.ts','utf8');
const payroll=fs.readFileSync('app/api/payroll-periods/route.ts','utf8');
for(const value of ['organization_id=${organizationId}','Location is unavailable for this organization']) if(!scope.includes(value)) throw new Error(`missing scope guard: ${value}`);
for(const value of ['requireOrganizationLocation','requireOrganizationEntity','supplierId','productId']) if(!orders.includes(value)) throw new Error(`orders missing tenant guard: ${value}`);
if(!payroll.includes('requireOrganizationLocation')) throw new Error('payroll create location is not tenant-scoped');
console.log('v0.16.14 tenant scope checks passed');
