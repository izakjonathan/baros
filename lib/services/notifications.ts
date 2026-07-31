import { db } from "@/lib/db/client";
export async function createNotification(input: { organizationId: string; userId: string; type: string; title: string; body?: string; href?: string; actorUserId?: string }) {
  await db()`insert into notifications (organization_id, user_id, actor_user_id, type, title, body, href) values (${input.organizationId}, ${input.userId}, ${input.actorUserId || null}, ${input.type}, ${input.title}, ${input.body || null}, ${input.href || null})`;
}
