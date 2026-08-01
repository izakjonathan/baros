import { randomBytes, scrypt as cb } from "node:crypto";
import { promisify } from "node:util";
import postgres from "postgres";
if (process.env.ALLOW_DATABASE_SEED !== "SEED BAROS") {
  throw new Error("Database seeding is blocked. Set ALLOW_DATABASE_SEED=SEED BAROS for an intentional seed run.");
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
if (!process.env.SEED_OWNER_EMAIL) throw new Error("SEED_OWNER_EMAIL is required");
if (!process.env.SEED_OWNER_PASSWORD || process.env.SEED_OWNER_PASSWORD.length < 12) {
  throw new Error("SEED_OWNER_PASSWORD must contain at least 12 characters");
}
const scrypt=promisify(cb), sql=postgres(process.env.DATABASE_URL,{prepare:false,max:1});
const password=process.env.SEED_OWNER_PASSWORD, salt=randomBytes(16).toString('hex'), derived=await scrypt(password,salt,64), hash=`scrypt:${salt}:${derived.toString('hex')}`;
await sql.begin(async tx=>{
 const [org]=await tx`insert into organizations(name,slug) values('Bar Ops Demo','bar-ops-demo') on conflict(slug) do update set name=excluded.name returning id`;
 const [loc]=await tx`insert into locations(organization_id,name,slug,address) values(${org.id},'Temple Bar','temple-bar','Copenhagen') on conflict(organization_id,slug) do update set name=excluded.name returning id`;
 const [user]=await tx`insert into users(email,name,password_hash) values(${process.env.SEED_OWNER_EMAIL},'Izak Hyllested',${hash}) on conflict(email) do update set name=excluded.name,password_hash=excluded.password_hash returning id`;
 await tx`insert into memberships(organization_id,user_id,role) values(${org.id},${user.id},'OWNER') on conflict(organization_id,user_id) do update set role='OWNER'`;
 const employees=[['Alex','Morgan','alex@barops.local','General manager',165],['Maya','Chen','maya@barops.local','Bar manager',160],['Jonas','Berg','jonas@barops.local','Bartender',145],['Sofia','Lund','sofia@barops.local','Floor',140],['Noah','Singh','noah@barops.local','Bartender',145],['Ella','Rose','ella@barops.local','Floor',140]];
 for(const e of employees){const [emp]=await tx`insert into employees(organization_id,first_name,last_name,email,employment_title,hourly_rate) values(${org.id},${e[0]},${e[1]},${e[2]},${e[3]},${e[4]}) on conflict(organization_id,email) do update set employment_title=excluded.employment_title returning id`;await tx`insert into employee_locations(employee_id,location_id,primary_location) values(${emp.id},${loc.id},true) on conflict do nothing`;}
 const employeePassword='Employee123!', employeeSalt=randomBytes(16).toString('hex'), employeeDerived=await scrypt(employeePassword,employeeSalt,64), employeeHash=`scrypt:${employeeSalt}:${employeeDerived.toString('hex')}`;
 const [employeeUser]=await tx`insert into users(email,name,password_hash) values('maya@barops.local','Maya Chen',${employeeHash}) on conflict(email) do update set name=excluded.name,password_hash=excluded.password_hash returning id`;
 await tx`insert into memberships(organization_id,user_id,role) values(${org.id},${employeeUser.id},'EMPLOYEE') on conflict(organization_id,user_id) do update set role='EMPLOYEE'`;
 await tx`update employees set user_id=${employeeUser.id} where organization_id=${org.id} and email='maya@barops.local'`;
 const suppliers=[['Nordic Drinks','orders@nordic.example'],['Vin & Co.','orders@vin.example'],['Bar Supply DK','orders@barsupply.example'],['City Produce','orders@produce.example']];
 for(const s of suppliers) await tx`insert into suppliers(organization_id,name,email) values(${org.id},${s[0]},${s[1]}) on conflict(organization_id,name) do nothing`;
 const products=[['Pilsner 30L','Draught beer','kegs',728,'Nordic Drinks',2,6],['House IPA 30L','Draught beer','kegs',894,'Nordic Drinks',3,4],['House Red','Wine','bottles',74,'Vin & Co.',8,18],['House White','Wine','bottles',71,'Vin & Co.',14,18],['London Dry Gin','Spirits','bottles',164,'Bar Supply DK',5,8],['Vodka','Spirits','bottles',142,'Bar Supply DK',9,8],['Tonic Water','Soft drinks','bottles',12,'Nordic Drinks',28,48],['Limes','Fresh','pieces',3.5,'City Produce',22,50]];
 for(const p of products){const [prod]=await tx`insert into products(organization_id,supplier_id,name,category,unit,purchase_price) select ${org.id},id,${p[0]},${p[1]},${p[2]},${p[3]} from suppliers where organization_id=${org.id} and name=${p[4]} on conflict(organization_id,name) do update set purchase_price=excluded.purchase_price returning id`;await tx`insert into location_inventory(location_id,product_id,quantity,par_level) values(${loc.id},${prod.id},${p[5]},${p[6]}) on conflict(location_id,product_id) do update set quantity=excluded.quantity,par_level=excluded.par_level`;}
});
console.log(`Seed complete. Manager account: ${process.env.SEED_OWNER_EMAIL}. Employee test account: maya@barops.local.`); await sql.end();
