import fs from "node:fs";
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
if(pkg.version!=="0.16.1") throw new Error(`Expected 0.16.1, found ${pkg.version}`);
if(!pkg.scripts["validate:env"]||!pkg.scripts["test:v0160-runtime"]||!pkg.scripts["test:v0161-guardrails"]) throw new Error("Missing production hardening scripts");
if(fs.existsSync("vercel.json")||fs.existsSync("public/offline.html")) throw new Error("Known deployment-problem files returned");
if(!fs.existsSync("public/sw.js")) throw new Error("Service worker should remain included");
const workflow=fs.readFileSync(".github/workflows/quality.yml","utf8");
if(!workflow.includes("Validate production environment contract")) throw new Error("CI environment contract gate missing");
console.log("v0.16.1 operational guardrail checks passed");
