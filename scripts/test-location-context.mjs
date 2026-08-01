import fs from "node:fs";
const app=fs.readFileSync("components/bar-ops-app.tsx","utf8");
const bootstrap=fs.readFileSync("app/api/manager/bootstrap/route.ts","utf8");
const shifts=fs.readFileSync("app/api/shifts/route.ts","utf8");
const products=fs.readFileSync("app/api/products/route.ts","utf8");
const data=fs.readFileSync("lib/data.ts","utf8");
const checks=[
  [app.includes("selectedLocationId"),"manager keeps a selected location"],
  [app.includes("locations.length > 1"),"location selector appears for multi-location organizations"],
  [app.includes("locationId:x.locationId || selectedLocationId"),"shift creation sends locationId"],
  [app.includes("No active location is configured"),"missing-location state is actionable"],
  [bootstrap.includes("selectedLocationId")&&bootstrap.includes("s.location_id=${selectedLocationId}"),"bootstrap scopes operational data to selected location"],
  [shifts.includes('body.locationId ? uuid(body.locationId, "locationId") : user.locationId'),"shift API accepts explicit manager location"],
  [products.includes("b.locationId?uuid(b.locationId,'locationId'):u.locationId"),"product writes inherit selected location"],
  [data.includes("locationId?: string"),"shift domain carries canonical location"],
];
let failed=0;for(const [ok,label] of checks){console.log(`${ok?"✓":"✗"} ${label}`);if(!ok)failed++;}if(failed)process.exit(1);
