import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const pkg = JSON.parse(read("package.json"));
const lock = JSON.parse(read("package-lock.json"));
const readme = read("README.md");
const workflow = read(".github/workflows/quality.yml");
const preflight = read("scripts/preflight-stabilization.mjs");
const artifactAudit = read("scripts/check-release-artifacts.mjs");

const declarations = [...readme.matchAll(/^Current release:\s*\*\*v([^*]+)\*\*/gm)];
if (declarations.length !== 1) throw new Error("README contains duplicate current-release declarations");
if (declarations[0][1] !== pkg.version) throw new Error("README current release does not match package version");
if (!/^Rollback checkpoint: \*\*v\d+\.\d+\.\d+(?:\.\d+)?(?:-rc\.\d+)?\*\*\.$/m.test(readme)) throw new Error("rollback checkpoint is not consolidated");
if (pkg.scripts?.["audit:preflight"] !== "node scripts/preflight-stabilization.mjs") throw new Error("audit:preflight script is missing");
if (pkg.scripts?.["audit:artifacts"] !== "node scripts/check-release-artifacts.mjs") throw new Error("audit:artifacts script is missing");
if (pkg.packageManager !== "npm@10.9.2") throw new Error("package manager is not pinned to npm@10.9.2");
if (lock.lockfileVersion !== 3 || lock.name !== pkg.name || lock.version !== pkg.version) throw new Error("lockfile root contract does not match package.json");
if (!workflow.includes("npm run audit:preflight")) throw new Error("quality workflow does not run final stabilization preflight");
if (!workflow.includes("npm run audit:artifacts")) throw new Error("quality workflow does not run release artifact audit");
if (!workflow.includes("corepack enable npm") || !workflow.includes("npm --version") || !workflow.includes("10.9.2")) throw new Error("quality workflow does not activate the declared npm version");
if (!workflow.includes("npm ci --no-audit --no-fund")) throw new Error("quality workflow does not use deterministic npm ci installation");
if (workflow.includes("npm install --no-audit --no-fund")) throw new Error("quality workflow still uses mutable npm install");
if (!workflow.includes("cache-dependency-path: package-lock.json")) throw new Error("quality workflow does not key dependency caching to package-lock.json");
for (const required of ["node_modules", ".next"]) {
  if (!artifactAudit.includes(required)) throw new Error(`artifact audit does not cover ${required}`);
}
if (!artifactAudit.includes("package-lock.json")) throw new Error("artifact audit does not validate package-lock.json");
for (const required of [".env.local", "request.json", "tx\\s+as\\s+any", "validate-release.mjs"]) {
  if (!preflight.includes(required)) throw new Error(`preflight does not cover ${required}`);
}

console.log(`Release and stabilization contract passed for v${pkg.version}`);
