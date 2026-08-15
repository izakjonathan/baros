import fs from "node:fs";
const routes = [
  "app/api/attendance-alerts/route.ts",
  "app/api/schedule-templates/route.ts",
  "app/api/security/route.ts",
];
for (const file of routes) {
  const source = fs.readFileSync(file, "utf8");
  if (source.includes(".json()")) throw new Error(`${file} still uses unbounded Request.json()`);
  if (!source.includes("readJsonObject")) throw new Error(`${file} does not use the bounded JSON parser`);
  if (!source.includes("jsonError(error, request)")) throw new Error(`${file} does not preserve request-aware error responses`);
}
const templates = fs.readFileSync("app/api/schedule-templates/route.ts", "utf8");
if (!templates.includes("requireOrganizationLocation")) throw new Error("schedule templates do not validate organization location scope");
const security = fs.readFileSync("app/api/security/route.ts", "utf8");
for (const token of ["SECURITY_ACTIONS", "GDPR_REQUEST_TYPES", "enumValue", "uuid(body.sessionId"]) {
  if (!security.includes(token)) throw new Error(`security action validation is missing ${token}`);
}
console.log("v0.16.18 API boundary completion checks passed");
