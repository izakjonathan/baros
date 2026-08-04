import fs from "node:fs";

const read=(file)=>fs.readFileSync(file,"utf8");
const pkg=JSON.parse(read("package.json"));
const failures=[];
const tokens=read("styles/tokens.css").toLowerCase();
const team=read("features/employees/TeamWorkspace.module.css");
const app=read("components/bar-ops-app.tsx");
const brief=read("docs/phase-d-visual-design-system.md");

if (!pkg.version.startsWith("0.18.4")) failures.push("package version must identify v0.18.4");
for (const value of ["#fff4c4","#000000","#dfee4b","#f47add","#4e4ced","#feb34a"]) {
  if (!tokens.includes(value)) failures.push(`approved palette value missing: ${value}`);
}
for (const token of ["--surface-employee","--surface-shift","--surface-inventory","--surface-order","--shadow-sm:none","--shadow-md:none"]) {
  if (!tokens.includes(token)) failures.push(`design token missing: ${token}`);
}
if (!brief.includes("Globalise design decisions. Localise component implementation.")) failures.push("formal visual design brief is incomplete");
if (!brief.includes("No shadows, gradients, glow or glass effects")) failures.push("brief must define prohibited effects");
if (!(team.includes("background:var(--surface-employee)") || team.includes("background:#dfee4b"))) failures.push("team cards must use employee semantic colour");
if (!team.includes("grid-template-columns:repeat(2")) failures.push("team workspace must prefer a two-column card grid");
if (!team.includes("box-shadow:none")) failures.push("team workspace must remain shadow-free");
if (!app.includes('import teamStyles from "@/features/employees/TeamWorkspace.module.css"')) failures.push("team workspace must use its CSS Module");
for (const behavior of ["scheduledHours(person)","onEdit(person)","onInvite(person)","onRevoke(person)"]) {
  if (!app.includes(behavior)) failures.push(`employee behavior missing: ${behavior}`);
}
if (failures.length) { failures.forEach(f=>console.error(`v0.18.4 ERROR: ${f}`)); process.exit(1); }
console.log("v0.18.4 visual-system and employees/team regression passed");
