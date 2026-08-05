import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const workflow = fs.readFileSync(".github/workflows/quality.yml", "utf8");
const preflight = fs.readFileSync("scripts/preflight-stabilization.mjs", "utf8");
const artifactAudit = fs.readFileSync("scripts/check-release-artifacts.mjs", "utf8");
if (pkg.scripts?.["audit:preflight"] !== "node scripts/preflight-stabilization.mjs") throw new Error("audit:preflight script is missing");
if (pkg.scripts?.["audit:artifacts"] !== "node scripts/check-release-artifacts.mjs") throw new Error("audit:artifacts script is missing");
if (!workflow.includes("npm run audit:preflight")) throw new Error("quality workflow does not run final stabilization preflight");
if (!workflow.includes("npm run audit:artifacts")) throw new Error("quality workflow does not run release artifact audit");
for (const required of ["node_modules", ".next"]) {
  if (!artifactAudit.includes(required)) throw new Error(`artifact audit does not cover ${required}`);
}
for (const required of [".env.local", "request.json", "tx\\s+as\\s+any", "validate-release.mjs"]) {
  if (!preflight.includes(required)) throw new Error(`preflight does not cover ${required}`);
}
console.log("v0.16.21 final stabilization gate checks passed");
