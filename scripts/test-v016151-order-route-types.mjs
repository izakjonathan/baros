import fs from 'node:fs';
const src=fs.readFileSync('app/api/orders/route.ts','utf8');
for (const token of ['objectArray(body.items', 'optionalString(body, "orderNumber"', 'enumValue(body.status', 'isoDate(body.expectedDelivery', 'optionalString(body, "notes"']) {
  if (!src.includes(token)) throw new Error(`missing typed request narrowing: ${token}`);
}
if (src.includes('${body.orderNumber ||') || src.includes('${body.status ||') || src.includes('${body.expectedDelivery ||') || src.includes('${body.notes ||')) throw new Error('raw unknown body value remains in SQL interpolation');
console.log('v0.16.15.1 order route type checks passed');
