import fs from "node:fs";
const read=(p)=>fs.readFileSync(p,"utf8");
const pkg=JSON.parse(read("package.json"));
const [major,minor,patch]=pkg.version.split(".").map(Number);
if(major!==0 || minor<18 || (minor===18 && patch<1)) throw new Error("Expected v0.18.1 or newer redesign release");
for(const file of ["app/design-system.css","styles/tokens.css","styles/reset.css","styles/base.css","styles/typography.css","styles/layouts.css","styles/utilities.css","components/ui/primitives/Button.module.css","components/ui/primitives/Card.module.css","components/ui/primitives/Badge.module.css"]){if(!fs.existsSync(file))throw new Error(`Missing design-system file: ${file}`)}
const tokens=read("styles/tokens.css");
for(const token of ["--color-beige","--surface-page","--text-primary","--space-6","--radius-card","--shadow-md","--content-width","--duration-normal","--z-modal"]){if(!tokens.includes(token))throw new Error(`Missing token ${token}`)}
const entry=read("app/design-system.css");
if(!entry.includes("@layer reset, tokens, base, layouts, components, utilities"))throw new Error("Cascade layer order missing");
const scope=read("docs/phase-d-scope.md");
if(!scope.includes("Components control their internal presentation, while parent layouts control external spacing and placement"))throw new Error("Core Phase D principle missing");
console.log("v0.18.0 design system foundation checks passed");
