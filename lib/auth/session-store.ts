import { createHash } from "node:crypto";
import type { TransactionSql } from "postgres";

type DbExecutor = TransactionSql<Record<string, never>>;

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function persistSessionRecord(
  tx: DbExecutor,
  input: {
    userId: string;
    organizationId: string;
    locationId: string | null;
    rawToken: string;
    expiresAt: Date;
    retain?: number;
  },
) {
  const retain = Math.max(1, Math.min(50, input.retain ?? 10));

  await tx`delete from sessions where expires_at <= now()`;
  await tx`
    insert into sessions (user_id, organization_id, location_id, token_hash, expires_at)
    values (${input.userId}, ${input.organizationId}, ${input.locationId}, ${hashSessionToken(input.rawToken)}, ${input.expiresAt})
  `;
  await tx`
    delete from sessions
    where id in (
      select id from sessions
      where user_id = ${input.userId} and organization_id = ${input.organizationId}
      order by expires_at desc, id desc
      offset ${retain}
    )
  `;
}
