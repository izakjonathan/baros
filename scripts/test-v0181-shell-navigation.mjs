import fs from "node:fs";
const read=(p)=>fs.readFileSync(p,"utf8");
for(const file of ["components/shell/ManagerShell.module.css","app/employee/EmployeeShell.module.css"]){if(!fs.existsSync(file))throw new Error(`Missing shell CSS Module: ${file}`)}
const manager=read("components/bar-ops-app.tsx");
if(!manager.includes('ManagerShell.module.css'))throw new Error("Manager shell does not use locally scoped CSS Module");
if(!manager.includes("shellStyles.sidebar")||!manager.includes("shellStyles.topbar"))throw new Error("Manager navigation shell module classes missing");
const employee=read("app/employee/employee-shell.tsx");
if(!employee.includes('EmployeeShell.module.css'))throw new Error("Employee shell does not use locally scoped CSS Module");
if(!employee.includes("styles.navigation")||!employee.includes("styles.header"))throw new Error("Employee shell module classes missing");
if(!manager.includes('aria-current={active === item.id ? "page" : undefined}'))throw new Error("Manager active navigation semantics changed");
if(!employee.includes("aria-current={path===href?'page':undefined}"))throw new Error("Employee active navigation semantics changed");
console.log("v0.18.1 application shell and navigation checks passed");
