import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const workflow = fs.readFileSync(".github/workflows/quality.yml", "utf8");
const preflight = fs.readFileSync("scripts/preflight-stabilization.mjs", "utf8");
if (pkg.scripts?.["audit:preflight"] !== "node scripts/preflight-stabilization.mjs") throw new Error("audit:preflight script is missing");
if (!workflow.includes("npm run audit:preflight")) throw new Error("quality workflow does not run final stabilization preflight");
for (const required of ["node_modules", ".next", ".env.local", "request.json", "tx\\s+as\\s+any", "validate-release.mjs"]) {
  if (!preflight.includes(required)) throw new Error(`preflight does not cover ${required}`);
}
console.log("v0.16.21 final stabilization gate checks passed");
