import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx|mjs)$/.test(entry.name)) files.push(full);
  }
}
walk(path.join(root, "app"));
walk(path.join(root, "lib"));
const bad = files.filter((file) => fs.readFileSync(file, "utf8").includes("db().transaction"));
if (bad.length) {
  console.error("Unsupported postgres.js transaction method found:\n" + bad.join("\n"));
  process.exit(1);
}
const transactional = files.filter((file) => fs.readFileSync(file, "utf8").includes("db().begin"));
if (!transactional.length) {
  console.error("No postgres.js transactions detected");
  process.exit(1);
}
console.log(`postgres.js API check passed (${transactional.length} transactional route files).`);
