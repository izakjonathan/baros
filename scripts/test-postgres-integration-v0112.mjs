import postgres from "postgres";
import assert from "node:assert/strict";

const url = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  console.log("Skipping PostgreSQL integration tests: TEST_DATABASE_URL is not configured.");
  process.exit(0);
}

const sql = postgres(url, { max: 2, prepare: false, connect_timeout: 15, idle_timeout: 5 });
const suffix = Math.random().toString(36).slice(2, 10);
let organizationId;
try {
  const [org] = await sql`insert into organizations(name,slug) values(${'Integration '+suffix},${'integration-'+suffix}) returning id`;
  organizationId = org.id;
  const [location] = await sql`insert into locations(organization_id,name,slug) values(${org.id},'Test Bar',${'test-bar-'+suffix}) returning id`;
  const [user] = await sql`insert into users(email,name,password_hash) values(${`integration-${suffix}@barops.local`},'Integration Manager','not-used') returning id`;
  await sql`insert into memberships(organization_id,user_id,role) values(${org.id},${user.id},'MANAGER')`;

  const [task] = await sql.begin(async tx => {
    const [created] = await tx`insert into operational_tasks(organization_id,location_id,title,task_type,created_by) values(${org.id},${location.id},'Open the bar','Opening',${user.id}) returning *`;
    await tx`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id) values(${org.id},${location.id},${user.id},'OPERATIONAL_TASK_CREATED','operational_task',${created.id})`;
    return [created];
  });
  assert.equal(task.title, 'Open the bar');
  const [updated] = await sql`update operational_tasks set done=true,completed_by=${user.id},completed_at=now() where id=${task.id} returning *`;
  assert.equal(updated.done, true);

  const [log] = await sql`insert into manager_log_entries(organization_id,location_id,title,body,author_user_id) values(${org.id},${location.id},'Shift handover','Test note',${user.id}) returning *`;
  assert.equal(log.body, 'Test note');

  const [otherOrg] = await sql`insert into organizations(name,slug) values(${'Other '+suffix},${'other-'+suffix}) returning id`;
  await assert.rejects(
    () => sql`insert into operational_tasks(organization_id,location_id,title) values(${otherOrg.id},${location.id},'Cross tenant task')`,
    /does not belong to organization/
  );
  await sql`delete from organizations where id=${otherOrg.id}`;

  const [counts] = await sql`select (select count(*)::int from operational_tasks where organization_id=${org.id}) tasks,(select count(*)::int from manager_log_entries where organization_id=${org.id}) logs,(select count(*)::int from audit_logs where organization_id=${org.id}) audits`;
  assert.equal(counts.tasks, 1);
  assert.equal(counts.logs, 1);
  assert.equal(counts.audits, 1);
  console.log("PostgreSQL integration tests passed: migrations, transactions, Daily Operations persistence, audit and tenant guard.");
} finally {
  if (organizationId) await sql`delete from organizations where id=${organizationId}`;
  await sql.end({ timeout: 5 });
}
