import fs from "node:fs";
const read=(p)=>fs.readFileSync(p,"utf8");
const migration=read("db/migrations/007_employee_portal_access.sql");
const invite=read("app/api/employee-invitations/route.ts");
const activate=read("app/api/auth/activate/route.ts");
const page=read("app/activate/[token]/page.tsx");
const ui=read("components/bar-ops-app.tsx");
const checks=[
 ["invitation table",migration.includes("create table employee_invitations")],
 ["single pending invitation",migration.includes("employee_invitations_one_pending_idx")],
 ["random single-use token",invite.includes("randomBytes(32)")&&invite.includes("tokenHash(token)")],
 ["seven-day expiry",invite.includes("7 * 86400000")],
 ["manager role protection",invite.includes('"OWNER", "ADMIN", "MANAGER"')],
 ["activation transaction",activate.includes("db().begin")],
 ["password hashing",activate.includes("hashPassword(password)")],
 ["employee membership",activate.includes("'EMPLOYEE'")],
 ["employee linkage",/update\s+employees[\s\S]*set\s+user_id/.test(activate)],
 ["single-use acceptance",/status\s*=\s*['"]ACCEPTED['"]/.test(activate)],
 ["activation page",page.includes("ActivationForm")],
 ["manager share action",ui.includes("navigator.share")&&ui.includes("Invite to portal")],
];
for(const [name,ok] of checks){if(!ok)throw new Error(`FAIL ${name}`);console.log(`PASS ${name}`)}
