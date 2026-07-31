import assert from "node:assert/strict";
const entries=[
 {employee:"A",date:"2026-07-27",worked:7.5,status:"APPROVED"},
 {employee:"A",date:"2026-07-28",worked:8,status:"PENDING"},
 {employee:"B",date:"2026-07-29",worked:6.25,status:"APPROVED"},
 {employee:"B",date:"2026-08-05",worked:9,status:"APPROVED"},
];
const from="2026-07-27",to="2026-08-02";
const approved=entries.filter(e=>e.status==="APPROVED"&&e.date>=from&&e.date<=to);
assert.equal(approved.length,2,"Only approved records within the period may export");
const totals=approved.reduce((acc,e)=>{(acc[e.employee]??=[]).push(e);return acc;},{});
assert.equal(totals.A.reduce((n,e)=>n+e.worked,0),7.5);
assert.equal(totals.B.reduce((n,e)=>n+e.worked,0),6.25);
assert.ok(!approved.some(e=>e.status==="PENDING"),"Pending timesheets must never export");
console.log("Payroll export logic tests passed");
