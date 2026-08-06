import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/auth/session";
import { requireOrganizationLocation } from "@/lib/auth/scope";
import { db } from "@/lib/db/client";
import { ApiError, jsonError, objectArray, optionalString, readJsonObject, requiredString, uuid } from "@/lib/http";

export async function GET() {
  const user = await requireCapability("schedule.read");
  return NextResponse.json(await db()`select * from schedule_templates where organization_id=${user.organizationId} and (${user.locationId}::uuid is null or location_id=${user.locationId}) and active order by name`);
}

export async function POST(request: Request) {
  try {
    const user = await requireCapability("schedule.templates.manage");
    const body = await readJsonObject(request, 24_000);
    const locationId = body.locationId ? uuid(body.locationId, "locationId") : user.locationId;
    await requireOrganizationLocation(db(), user.organizationId, locationId);
    const name = requiredString(body, "name", 120);
    const description = optionalString(body, "description", 1_000);
    const template = objectArray(body.template ?? [], "template", 100);
    if (!template.length) throw new ApiError(400, "template must include at least one item");
    const [row] = await db()`insert into schedule_templates(organization_id,location_id,name,description,template,created_by) values(${user.organizationId},${locationId},${name},${description},${JSON.stringify(template)}::jsonb,${user.userId}) returning *`;
    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    return jsonError(error, request);
  }
}
