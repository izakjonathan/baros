import fs from "node:fs";

const css = fs.readFileSync("app/product-system.css", "utf8");
const shell = fs.readFileSync("components/app-shell.tsx", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

if (!(["0.11.7","0.11.8","0.11.9","0.12.0","0.12.1","0.13.0","0.13.1","0.13.2","0.14.0"].includes(pkg.version))) throw new Error("Expected v0.11.7-compatible");
if (!css.includes(".floating-navigation-toggle svg")) throw new Error("Missing scoped toggle icon rule");
if (!/\.floating-navigation-toggle svg[\s\S]*color:\s*#ffffff/.test(css)) throw new Error("Toggle icon is not forced white");
if (!css.includes("overflow-x: auto")) throw new Error("Navigation strip must scroll horizontally");
if (!css.includes("position: fixed")) throw new Error("Floating navigation must remain fixed");
if (!shell.includes("open ? <X") || !shell.includes(": <Menu")) throw new Error("Toggle must switch Menu to X");
if (/userName|userRole/.test(shell.split("export function FloatingNavigation")[1].split("export function Topbar")[0]) && shell.includes("floating-navigation-user")) throw new Error("Profile block must not be rendered");
console.log("v0.11.7 floating navigation verification passed");
