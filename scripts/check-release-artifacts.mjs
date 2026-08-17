import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const forbidden = [
  "node_modules",
  ".next",
  ".vercel",
  "vercel.json",
  "public/offline.html",
  "tsconfig.tsbuildinfo",
];
for (const entry of forbidden) {
  if (fs.existsSync(path.join(root, entry))) failures.push(`Forbidden release artifact present: ${entry}`);
}
if (!fs.existsSync(path.join(root, "public/sw.js"))) {
  failures.push("public/sw.js must be present");
}

const packagePath = path.join(root, "package.json");
const lockPath = path.join(root, "package-lock.json");
if (!fs.existsSync(lockPath)) {
  failures.push("package-lock.json must be present");
} else {
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
    const lockRoot = lock.packages?.[""];

    if (pkg.packageManager !== "npm@10.9.2") failures.push("packageManager must remain pinned to npm@10.9.2");
    if (lock.lockfileVersion !== 3) failures.push("package-lock.json must use lockfileVersion 3");
    if (!lockRoot) failures.push("package-lock.json is missing its root package entry");
    if (lock.name !== pkg.name || lock.version !== pkg.version) failures.push("package-lock.json package identity does not match package.json");

    for (const section of ["dependencies", "devDependencies"]) {
      for (const [name, version] of Object.entries(pkg[section] ?? {})) {
        if (lockRoot?.[section]?.[name] !== version) failures.push(`package-lock.json does not pin ${section}.${name} to ${version}`);
        if (!lock.packages?.[`node_modules/${name}`]) failures.push(`package-lock.json is missing ${name}`);
      }
    }

    for (const [entryPath, entry] of Object.entries(lock.packages ?? {})) {
      if (entryPath && !entry.link && (!entry.version || !entry.resolved || !entry.integrity)) {
        failures.push(`package-lock.json contains an incomplete registry entry: ${entryPath}`);
      }
    }
  } catch (error) {
    failures.push(`package-lock.json could not be validated: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`ARTIFACT ERROR: ${failure}`);
  process.exit(1);
}
console.log("Release artifact check passed");
