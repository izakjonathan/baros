import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const route = fs.readFileSync("app/api/availability/route.ts", "utf8");
const checks = [
  ["release version", ["0.11.4", "0.11.5"].includes(pkg.version)],
  ["monthly date is narrowed", route.includes("const date = rule.date as string")],
  ["availability is normalized", route.includes("const available = rule.available !== false")],
  ["optional start is null-safe", route.includes("const availableFrom: string | null = available ? rule.availableFrom ?? null : null")],
  ["optional end is null-safe", route.includes("const availableTo: string | null = available ? rule.availableTo ?? null : null")],
  ["optional note is null-safe", route.includes("const note: string | null = rule.note ?? null")],
  ["SQL receives normalized values", route.includes("${availableFrom},${availableTo},${available},${date}::date,${date}::date,${note}")],
  ["monthly SQL uses only normalized optionals", route.includes("${weekday},${availableFrom},${availableTo},${available},${date}::date,${date}::date,${note}")],
];
for (const [name, ok] of checks) {
  if (!ok) throw new Error(`v0.11.4 check failed: ${name}`);
  console.log(`✓ ${name}`);
}
