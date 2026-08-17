import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));
const pkg = JSON.parse(read("package.json"));
const expected = `v${pkg.version}`;
const failures = [];

for (const file of ["README.md", "IMPLEMENTATION_STATUS.md", "RELEASE_NOTES.md", "VALIDATION_LOG.md"]) {
  if (!exists(file)) failures.push(`Missing required release document: ${file}`);
  else if (!read(file).includes(expected)) failures.push(`${file} does not identify ${expected}`);
}
if (pkg.engines?.node !== "24.x") failures.push("package.json must pin Node 24.x");
if (pkg.packageManager !== "npm@10.9.2") failures.push("package.json must pin npm 10.9.2");
if (!exists("package-lock.json")) failures.push("package-lock.json must be included");
if (!exists("public/sw.js")) failures.push("public/sw.js must be included");
if (exists("public/offline.html")) failures.push("public/offline.html must remain absent");
if (exists("vercel.json")) failures.push("vercel.json must remain absent");
if (!read(".github/workflows/quality.yml").includes("node-version: 24")) failures.push("Quality workflow must use Node 24");
if (!read(".github/workflows/quality.yml").includes("npm ci --no-audit --no-fund")) failures.push("Quality workflow must use npm ci");
if (!read(".github/workflows/database-admin.yml").includes("node-version: 24")) failures.push("Database workflow must use Node 24");
if (!read("README.md").includes("Rollback checkpoint")) failures.push("README must document the rollback checkpoint");
if (!read("lib/release.ts").includes("VERCEL_GIT_COMMIT_SHA")) failures.push("Release metadata must include the Vercel commit SHA");

if (failures.length) {
  for (const failure of failures) console.error(`RELEASE ERROR: ${failure}`);
  process.exit(1);
}
console.log(`Release contract valid for ${expected}`);
