import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const route = fs.readFileSync(new URL("../app/api/availability/route.ts", import.meta.url), "utf8");

const checks = [
  ["release version", ["0.11.6","0.12.0","0.12.1","0.12.2","0.12.3","0.12.4","0.13.0","0.13.1","0.13.2","0.13.3"].includes(pkg.version),"0.12.0","0.12.1"],
  ["weekday narrowed to number", route.includes('typeof weekday !== "number"')],
  ["weekly rules normalized before transaction", route.includes("const weeklyRules = rules.map")],
  ["optional weekly times use null", route.includes("availableFrom: available ? rule.availableFrom ?? null : null") && route.includes("availableTo: available ? rule.availableTo ?? null : null")],
  ["weekly note uses null", route.includes("note: rule.note ?? null")],
  ["SQL inserts normalized weekday", route.includes("${rule.weekday},${rule.availableFrom},${rule.availableTo},${rule.available},${rule.note}")],
  ["raw optional weekday not inserted", !route.includes("${rule.weekday},${rule.availableFrom || null}")],
];
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) throw new Error(`v0.11.6 check failed: ${name}`);
}
