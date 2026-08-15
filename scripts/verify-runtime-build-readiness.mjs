import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const failures = [];
const warnings = [];
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

if (!/^0\.19\.0-rc\.(?:8|9|[1-9]\d+)$/.test(packageJson.version)) failures.push("package version is older than v0.19.0-rc.8");
if (!packageJson.packageManager) failures.push("packageManager is not pinned");
if (!existsSync(".npmrc")) failures.push(".npmrc is missing");
if (!existsSync("package-lock.json")) warnings.push("package-lock.json is not available; deterministic npm ci remains blocked");

const workflow = readFileSync(".github/workflows/quality.yml", "utf8");
if (!workflow.includes("npm run lint") || !workflow.includes("npm run typecheck") || !workflow.includes("npm run build")) {
  failures.push("quality workflow does not contain lint, type-check, and build gates");
}

for (const script of ["audit:artifacts", "audit:preflight", "validate:release", "test:current", "lint", "typecheck", "build"]) {
  if (!packageJson.scripts?.[script]) failures.push(`required script is missing: ${script}`);
}

try {
  execFileSync(process.execPath, ["--check", "scripts/verify-runtime-build-readiness.mjs"], { stdio: "ignore" });
} catch {
  failures.push("runtime readiness verifier has invalid syntax");
}

if (failures.length) {
  console.error("Runtime build readiness verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Runtime build readiness source contract passed.");
for (const warning of warnings) console.warn(`BLOCKED: ${warning}`);
