import { db } from "@/lib/db/client";
export async function writeAudit(input: { organizationId: string; actorUserId?: string | null; locationId?: string | null; action: string; entityType: string; entityId?: string | null; before?: unknown; after?: unknown; metadata?: unknown }) {
  await db()`insert into audit_logs (organization_id, location_id, actor_user_id, action, entity_type, entity_id, before_data, after_data, metadata)
    values (${input.organizationId}, ${input.locationId || null}, ${input.actorUserId || null}, ${input.action}, ${input.entityType}, ${input.entityId || null}, ${input.before ? JSON.stringify(input.before) : null}::jsonb, ${input.after ? JSON.stringify(input.after) : null}::jsonb, ${input.metadata ? JSON.stringify(input.metadata) : null}::jsonb)`;
}
