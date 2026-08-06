import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const warnings = [];
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));
const pkg = JSON.parse(read("package.json"));

for (const artifact of [".next", "node_modules", "tsconfig.tsbuildinfo", ".vercel", "vercel.json"]) {
  if (exists(artifact)) failures.push(`Generated or forbidden artifact is present: ${artifact}`);
}
for (const file of [".env", ".env.local", ".env.production", ".env.development.local"]) {
  if (exists(file)) failures.push(`Secret-bearing environment file is present: ${file}`);
}
for (const required of [".env.example", "PRODUCTION_ACCEPTANCE.md", "DEPLOYMENT_ROLLBACK.md", "V01814_DEVICE_ACCEPTANCE.md", "STAGING_ACCEPTANCE.md", "DEPLOYMENT_SIGNOFF.md", "RELEASE_CANDIDATE.md", "RC_DEFECT_LOG.md"]) {
  if (!exists(required)) failures.push(`Required production document is missing: ${required}`);
}
if (!["0.18.16", "0.19.0-rc.1"].includes(pkg.version)) failures.push("package.json version must be an approved production-readiness release");
if (pkg.engines?.node !== "24.x") failures.push("Production Node runtime must remain pinned to 24.x");
if (!pkg.scripts?.lint || !pkg.scripts?.typecheck || !pkg.scripts?.build) failures.push("Lint, type-check and build scripts are required");
if (!pkg.scripts?.["quality:release"]) failures.push("A single production release quality command is required");

for (const section of ["dependencies", "devDependencies"]) {
  for (const [name, version] of Object.entries(pkg[section] ?? {})) {
    if (/^[~^*><=]|\s|\|/.test(String(version))) failures.push(`${section}.${name} must remain exactly pinned`);
  }
}

const assetRoot = path.join(root, "public");
function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
for (const file of walk(assetRoot)) {
  const size = fs.statSync(file).size;
  if (size > 500_000) warnings.push(`${path.relative(root, file)} exceeds 500 KB (${size} bytes)`);
}

const workflow = read(".github/workflows/quality.yml");
for (const gate of ["audit:artifacts", "audit:preflight", "test:all", "lint", "typecheck", "validate:env", "build"]) {
  if (!workflow.includes(gate)) failures.push(`CI quality workflow is missing gate: ${gate}`);
}

if (failures.length) {
  failures.forEach((failure) => console.error(`PRODUCTION ERROR: ${failure}`));
  process.exit(1);
}
warnings.forEach((warning) => console.warn(`PRODUCTION WARN: ${warning}`));
console.log("Production readiness static audit passed");
