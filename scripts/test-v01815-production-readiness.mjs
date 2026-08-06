import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const requiredScripts = ["audit:production", "quality:release", "lint", "typecheck", "build", "validate:env"];
const failures = [];

if (!["0.18.16", "0.19.0-rc.1"].includes(pkg.version)) failures.push("package version does not inherit the production-readiness contract");
for (const script of requiredScripts) if (!pkg.scripts?.[script]) failures.push(`missing script: ${script}`);
for (const file of ["PRODUCTION_ACCEPTANCE.md", "DEPLOYMENT_ROLLBACK.md", "scripts/audit-production-readiness.mjs"]) {
  if (!fs.existsSync(file)) failures.push(`missing production artifact: ${file}`);
}
const readme = fs.readFileSync("README.md", "utf8");
if (!readme.includes(`Current release: **v${pkg.version}**`)) failures.push("README current release does not match package version");
if (!readme.includes("Rollback checkpoint: **v0.18.16**.") && !readme.includes("Rollback checkpoint: **v0.18.14**.")) failures.push("README rollback checkpoint is missing");
const release = fs.readFileSync("RELEASE_NOTES.md", "utf8");
if (!release.includes("v0.18.16") && !release.includes("v0.19.0-rc.1")) failures.push("release notes do not identify the production-readiness lineage");
if (fs.existsSync("tsconfig.tsbuildinfo")) failures.push("tsconfig.tsbuildinfo must not be packaged");

if (failures.length) {
  failures.forEach((failure) => console.error(`V01815 ERROR: ${failure}`));
  process.exit(1);
}
console.log("v0.18.16 production-readiness regression passed");
