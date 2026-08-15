import fs from "node:fs";
const read = p => fs.readFileSync(p,"utf8");
const rate = read("lib/security/rate-limit.ts");
const http = read("lib/http.ts");
const routes = ["app/api/auth/login/route.ts","app/api/auth/activate/route.ts","app/api/kiosk/route.ts","app/api/security/route.ts"].map(read).join("\n");
const failures=[];
if(!rate.includes("class RateLimitError")) failures.push("typed RateLimitError missing");
if(!rate.includes("retryAfterSeconds")) failures.push("retry metadata missing");
if(!http.includes('"retry-after"')) failures.push("Retry-After response header missing");
if(routes.includes('message === "RATE_LIMITED"')) failures.push("legacy string matching remains");
if(!routes.includes("jsonError(error, request)") && !routes.includes("jsonError(error, req)")) failures.push("shared error handling not applied");
if(failures.length){console.error(failures.join("\n"));process.exit(1)}
console.log("v0.16.2 request abuse protection checks passed");
