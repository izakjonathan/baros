import type { Sql } from "postgres";
import { ApiError } from "@/lib/http";

export type SqlRow = Record<string, unknown>;
export type SqlExecutor = Sql<Record<never, never>>;

export async function requireOrganizationLocation(
  sql: SqlExecutor,
  organizationId: string,
  locationId: string | null | undefined,
  options: { active?: boolean; lock?: boolean } = {},
) {
  if (!locationId) throw new ApiError(400, "A location is required");
  const active = options.active ?? true;
  const rows = options.lock
    ? await sql`select id from locations where id=${locationId} and organization_id=${organizationId} and (${active} = false or active=true) for share`
    : await sql`select id from locations where id=${locationId} and organization_id=${organizationId} and (${active} = false or active=true)`;
  if (!rows.length) throw new ApiError(403, "Location is unavailable for this organization");
  return locationId;
}

export async function requireOrganizationEntity(
  sql: SqlExecutor,
  table: "suppliers" | "products" | "employees",
  organizationId: string,
  entityId: string,
) {
  const rows = table === "suppliers"
    ? await sql`select id from suppliers where id=${entityId} and organization_id=${organizationId} and active=true`
    : table === "products"
      ? await sql`select id from products where id=${entityId} and organization_id=${organizationId}`
      : await sql`select id from employees where id=${entityId} and organization_id=${organizationId} and active=true`;
  if (!rows.length) throw new ApiError(403, `${table.slice(0, -1)} is unavailable for this organization`);
  return entityId;
}
