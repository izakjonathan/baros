import fs from "node:fs";
const read = p => fs.readFileSync(p,"utf8");
const pkg=JSON.parse(read("package.json")); const next=read("next.config.ts"); const obs=read("lib/observability.ts");
const live=read("app/api/health/live/route.ts"); const ready=read("app/api/health/ready/route.ts");
const failures=[];
if(pkg.version!=="0.16.3") failures.push("package version is not 0.16.3");
if(pkg.engines?.node!=="20.x") failures.push("Node runtime is not pinned to 20.x");
if(!live.includes('status: "alive"')) failures.push("liveness probe missing");
if(!ready.includes("TIMEOUT_MS")||!ready.includes("Promise.race")) failures.push("bounded readiness probe missing");
if(!next.includes("poweredByHeader: false")) failures.push("framework header disclosure not disabled");
if(!next.includes("Strict-Transport-Security")) failures.push("HSTS missing");
if(!obs.includes("A-Za-z0-9._:-")) failures.push("request ID sanitization missing");
if(failures.length){console.error(failures.join("\n"));process.exit(1)}
console.log("v0.16.3 health and runtime checks passed");
