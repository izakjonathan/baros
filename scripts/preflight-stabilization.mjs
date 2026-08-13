import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const failures = [];
const exists = (file) => fs.existsSync(path.join(root, file));
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const pkg = JSON.parse(read("package.json"));

for (const forbidden of [".vercel", "vercel.json", "public/offline.html"]) {
  if (exists(forbidden)) failures.push(`Forbidden repository artifact present: ${forbidden}`);
}
for (const secret of [".env", ".env.local", ".env.production", ".env.development.local"]) {
  if (exists(secret)) failures.push(`Environment secret file must not be packaged: ${secret}`);
}
if (!exists("public/sw.js")) failures.push("public/sw.js must be present");
if (pkg.engines?.node !== "24.x") failures.push("Node runtime must remain pinned to 24.x");

for (const section of ["dependencies", "devDependencies"]) {
  for (const [name, version] of Object.entries(pkg[section] ?? {})) {
    if (/^[~^*><=]|\s|\|/.test(String(version))) failures.push(`${section}.${name} must use an exact version`);
  }
}

const readme = read("README.md");
const currentReleaseMatches = [...readme.matchAll(/^Current release:\s*\*\*v([^*]+)\*\*/gm)];
if (currentReleaseMatches.length !== 1) failures.push("README must contain exactly one canonical Current release declaration");
if (!readme.includes(`v${pkg.version}`)) failures.push("README does not identify the package version");
if (!/^Rollback checkpoint: \*\*v\d+\.\d+\.\d+(?:\.\d+)?(?:-rc\.\d+)?\*\*\.$/m.test(readme)) failures.push("README must identify one explicit approved rollback checkpoint");

const apiFiles = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === "route.ts" || entry.name === "route.js") apiFiles.push(full);
  }
}
walk(path.join(root, "app", "api"));
for (const file of apiFiles) {
  const source = fs.readFileSync(file, "utf8");
  if (/\brequest\.json\s*\(/.test(source)) failures.push(`${path.relative(root, file)} uses unbounded request.json()`);
  if (/\btx\s+as\s+any\b/.test(source)) failures.push(`${path.relative(root, file)} casts a transaction to any`);
}

if (failures.length) {
  failures.forEach((failure) => console.error(`PREFLIGHT ERROR: ${failure}`));
  process.exit(1);
}

for (const command of [
  ["node", ["scripts/validate-release.mjs"]],
  ["node", ["scripts/test-v01618-api-boundary-completion.mjs"]],
  ["node", ["scripts/test-v01619-type-safety-stabilization.mjs"]],
  ["node", ["scripts/test-v01620-release-metadata.mjs"]],
  ["node", ["scripts/test-v01621-final-stabilization.mjs"]],
]) {
  const result = spawnSync(command[0], command[1], { stdio: "inherit", cwd: root });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`Final stabilization preflight passed for v${pkg.version}`);
