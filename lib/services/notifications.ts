import type { TransactionSql } from "postgres";

type DbExecutor = TransactionSql<Record<string, never>>;

export async function notifyEmployee(
  tx: DbExecutor,
  input: { organizationId: string; employeeId: string; actorUserId?: string | null; type: string; title: string; body?: string | null; href?: string | null },
) {
  await tx`
    insert into notifications(organization_id,user_id,actor_user_id,type,title,body,href)
    select ${input.organizationId},e.user_id,${input.actorUserId || null},${input.type},${input.title},${input.body || null},${input.href || null}
    from employees e
    where e.id=${input.employeeId} and e.organization_id=${input.organizationId} and e.user_id is not null
  `;
}

export async function notifyManagers(
  tx: DbExecutor,
  input: { organizationId: string; actorUserId?: string | null; type: string; title: string; body?: string | null; href?: string | null },
) {
  await tx`
    insert into notifications(organization_id,user_id,actor_user_id,type,title,body,href)
    select ${input.organizationId},m.user_id,${input.actorUserId || null},${input.type},${input.title},${input.body || null},${input.href || null}
    from memberships m
    where m.organization_id=${input.organizationId}
      and m.role in ('OWNER','ADMIN','MANAGER','SHIFT_MANAGER')
      and m.user_id<>coalesce(${input.actorUserId || null}::uuid,'00000000-0000-0000-0000-000000000000'::uuid)
  `;
}
