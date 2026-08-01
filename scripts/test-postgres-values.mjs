import fs from "node:fs";
import path from "node:path";

const roots = ["app", "lib"];
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
  }
}
for (const dir of roots) if (fs.existsSync(dir)) walk(dir);
const bad = [];
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  if (/\$\{\{/.test(text)) bad.push(`${file}: inline object interpolation`);
  if (/audit_logs[\s\S]{0,500}\$\{(?:employee|before|current|record|sheet|updated)\}(?!::jsonb)/.test(text)) bad.push(`${file}: row object interpolation without JSON serialization`);
}
if (bad.length) {
  console.error(bad.join("\n"));
  process.exit(1);
}
console.log(`postgres value checks passed (${files.length} files)`);
