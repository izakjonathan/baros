import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const forbidden = [
  "node_modules",
  ".next",
  ".vercel",
  "vercel.json",
  "public/offline.html",
];
const failures = forbidden.filter((entry) => fs.existsSync(path.join(root, entry)));
if (failures.length) {
  for (const entry of failures) console.error(`ARTIFACT ERROR: Forbidden release artifact present: ${entry}`);
  process.exit(1);
}
if (!fs.existsSync(path.join(root, "public/sw.js"))) {
  console.error("ARTIFACT ERROR: public/sw.js must be present");
  process.exit(1);
}
console.log("Release artifact check passed");
