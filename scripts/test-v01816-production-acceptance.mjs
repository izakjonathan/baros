import fs from "node:fs";

const failures = [];
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const requiredFiles = [
  "PRODUCTION_ACCEPTANCE.md",
  "STAGING_ACCEPTANCE.md",
  "DEPLOYMENT_SIGNOFF.md",
  "DEPLOYMENT_ROLLBACK.md",
  "V01814_DEVICE_ACCEPTANCE.md",
];

if (pkg.version !== "0.18.16") failures.push("package version is not v0.18.16");
for (const name of ["acceptance:source", "test:v01816-acceptance", "quality:release"]) {
  if (!pkg.scripts?.[name]) failures.push(`missing script: ${name}`);
}
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) failures.push(`missing acceptance artifact: ${file}`);
}
const readme = fs.readFileSync("README.md", "utf8");
if (!readme.includes("Current release: **v0.18.16**")) failures.push("README current release is not v0.18.16");
const notes = fs.readFileSync("RELEASE_NOTES.md", "utf8");
if (!notes.includes("v0.18.16")) failures.push("release notes do not identify v0.18.16");
const signoff = fs.readFileSync("DEPLOYMENT_SIGNOFF.md", "utf8");
if (!signoff.includes("pending external staging acceptance")) failures.push("sign-off must remain explicitly pending");
if (!signoff.includes("Promote the exact tested deployment")) failures.push("sign-off lacks exact-deployment promotion rule");
const matrix = fs.readFileSync("STAGING_ACCEPTANCE.md", "utf8");
for (const term of ["Manager workflows", "Employee workflows", "Device and browser matrix", "/api/health/ready"]) {
  if (!matrix.includes(term)) failures.push(`acceptance matrix missing: ${term}`);
}
if (fs.existsSync("node_modules") || fs.existsSync(".next") || fs.existsSync("vercel.json")) {
  failures.push("forbidden generated/deployment artifact is packaged");
}

if (failures.length) {
  failures.forEach((failure) => console.error(`V01816 ERROR: ${failure}`));
  process.exit(1);
}
console.log("v0.18.16 production-acceptance regression passed");
