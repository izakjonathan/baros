import fs from "node:fs";
import path from "node:path";

const walk = directory => fs.existsSync(directory)
  ? fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(target) : [target.replaceAll("\\\\", "/")];
    })
  : [];
const read = file => fs.readFileSync(file, "utf8");

const pageFiles = walk("app").filter(file => /\/(page|route)\.tsx?$/.test(file));
const forbiddenRoots = [
  "app/employee/", "app/api/shifts/", "app/api/timesheets/", "app/api/orders/",
  "app/api/products/", "app/api/employees/", "app/api/availability/",
];
const forbidden = pageFiles.filter(file => forbiddenRoots.some(root => file.startsWith(root)));
if (forbidden.length) throw new Error(`Legacy routes remain: ${forbidden.join(", ")}`);

const home = read("app/page.tsx");
const login = read("app/api/auth/login/route.ts");
const users = read("app/api/operation-users/route.ts");
const activation = read("app/api/auth/activate/route.ts");
const userPanel = read("features/operation/OperationUserManagement.tsx");
const loginPage = read("app/login/page.tsx");
const loginForm = read("app/login/login-form.tsx");
const globalStyles = read("app/globals.css");
const migration = read("db/migrations/025_operation_user_invitations.sql");

const checks = [
  ["root enters Operation", home.includes('redirect("/operation")')],
  ["every authenticated role enters Operation", login.includes('redirect:"/operation"')],
  ["user management is owner-only", users.includes('user.role !== "OWNER" && user.role !== "ADMIN"')],
  ["invitations support owner, manager and employee", users.includes('["OWNER", "MANAGER", "EMPLOYEE"]')],
  ["activation is single-use", activation.includes("status='PENDING'") && activation.includes("status='ACCEPTED'")],
  ["invitation secrets are stored as hashes", users.includes('createHash("sha256")') && migration.includes("token_hash")],
  ["owner settings can create and revoke invites", userPanel.includes("Add user") && userPanel.includes("Revoke")],
  ["owner settings can edit and delete users", userPanel.includes("updateUser") && userPanel.includes("removeUser") && users.includes("export async function DELETE")],
  ["user removal preserves history", users.includes("OPERATION_USER_ACCESS_REMOVED") && users.includes("delete from memberships") && !users.includes("delete from users")],
  ["owner safety guards are present", users.includes("You cannot delete your own access") && users.includes("The last owner cannot be deleted")],
  ["login loads the Operation UI theme", loginPage.includes("getLoginUiTheme") && loginForm.includes("operationThemeCustomProperties(theme)") && globalStyles.includes("background:var(--op-canvas)")],
  ["obsolete account guidance is removed", !userPanel.includes("The shared staff link remains the simplest employee access")],
  ["invitation schema is organization-scoped", migration.includes("organization_id") && migration.includes("enable row level security")],
];

for (const [name, passed] of checks) {
  if (!passed) throw new Error(`Operation-only check failed: ${name}`);
  console.log(`PASS ${name}`);
}

console.log(`PASS ${pageFiles.length} reachable page/route files checked`);
