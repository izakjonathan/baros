import fs from "node:fs";
const required=["app/error.tsx","app/global-error.tsx","app/not-found.tsx","lib/observability.ts","app/api/health/route.ts"];
for(const file of required) if(!fs.existsSync(file)) throw new Error(`Missing ${file}`);
const http=fs.readFileSync("lib/http.ts","utf8");
if(!http.includes('"x-request-id"')||!http.includes("logServerError")) throw new Error("API errors lack request IDs or structured logging");
const health=fs.readFileSync("app/api/health/route.ts","utf8");
if(!health.includes('cache-control": "no-store"')||health.includes("DATABASE_URL:")) throw new Error("Health endpoint is not safe");
console.log("v0.16.0 runtime resilience checks passed");
