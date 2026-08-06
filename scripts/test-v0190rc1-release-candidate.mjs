import fs from "node:fs";

const failures = [];
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const requiredFiles = [
  "PRODUCTION_ACCEPTANCE.md",
  "STAGING_ACCEPTANCE.md",
  "DEPLOYMENT_SIGNOFF.md",
  "DEPLOYMENT_ROLLBACK.md",
  "RELEASE_CANDIDATE.md",
  "RC_DEFECT_LOG.md",
];

if (pkg.version !== "0.19.0-rc.1") failures.push("package version is not 0.19.0-rc.1");
for (const name of ["acceptance:source", "quality:release", "test:v0190rc1"]) {
  if (!pkg.scripts?.[name]) failures.push(`missing script: ${name}`);
}
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) failures.push(`missing release-candidate artifact: ${file}`);
}
const readme = fs.readFileSync("README.md", "utf8");
if (!readme.includes("Current release: **v0.19.0-rc.1**")) failures.push("README current release is not v0.19.0-rc.1");
const notes = fs.readFileSync("RELEASE_NOTES.md", "utf8");
if (!notes.includes("v0.19.0-rc.1")) failures.push("release notes do not identify v0.19.0-rc.1");
const rc = fs.readFileSync("RELEASE_CANDIDATE.md", "utf8");
for (const term of ["Exact-source rule", "External gates still pending", "No feature development", "0.19.0-rc.1"]) {
  if (!rc.includes(term)) failures.push(`release candidate contract missing: ${term}`);
}
const signoff = fs.readFileSync("DEPLOYMENT_SIGNOFF.md", "utf8");
if (!signoff.includes("v0.19.0-rc.1")) failures.push("deployment sign-off is not assigned to rc.1");
if (!signoff.includes("pending external staging acceptance")) failures.push("sign-off must remain explicitly pending");
const workflow = fs.readFileSync(".github/workflows/quality.yml", "utf8");
if (!workflow.includes("npm run test:v0190rc1")) failures.push("CI does not validate the rc.1 contract");
if (fs.existsSync("node_modules") || fs.existsSync(".next") || fs.existsSync("vercel.json")) {
  failures.push("forbidden generated/deployment artifact is packaged");
}
if (fs.existsSync("package-lock.json")) {
  const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
  if (lock.version !== "0.19.0-rc.1" || lock.packages?.[""]?.version !== "0.19.0-rc.1") {
    failures.push("package-lock version does not match rc.1");
  }
}

if (failures.length) {
  failures.forEach((failure) => console.error(`V0190RC1 ERROR: ${failure}`));
  process.exit(1);
}
console.log("v0.19.0-rc.1 release-candidate regression passed");
