import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { requireOrganizationEntity, requireOrganizationLocation } from "@/lib/auth/scope";
import { db } from "@/lib/db/client";
import { ApiError, enumValue, isoDate, jsonError, objectArray, optionalString, readJsonObject, uuid } from "@/lib/http";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await db()`select po.*,s.name supplier,coalesce(sum(i.quantity*i.unit_price),0) total,count(i.id)::int items from purchase_orders po join suppliers s on s.id=po.supplier_id left join purchase_order_items i on i.purchase_order_id=po.id where po.organization_id=${user.organizationId} and (${user.locationId}::uuid is null or po.location_id=${user.locationId}) group by po.id,s.name order by po.created_at desc`);
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role === "EMPLOYEE") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await readJsonObject(request, 32_000);
    const locationId = body.locationId ? uuid(body.locationId, "locationId") : user.locationId;
    const supplierId = uuid(body.supplierId, "supplierId");
    const items = objectArray(body.items, "items", 250);
    const orderNumber = optionalString(body, "orderNumber", 100) ?? `PO-${Date.now()}`;
    const status = body.status == null || body.status === ""
      ? "DRAFT"
      : enumValue(body.status, "status", ["DRAFT", "SUBMITTED", "CONFIRMED", "DELIVERED", "CANCELLED"] as const);
    const expectedDelivery = body.expectedDelivery == null || body.expectedDelivery === ""
      ? null
      : isoDate(body.expectedDelivery, "expectedDelivery");
    const notes = optionalString(body, "notes", 2_000);

    const purchaseOrder = await db().begin(async (tx) => {
      await requireOrganizationLocation(tx, user.organizationId, locationId, { lock: true });
      await requireOrganizationEntity(tx, "suppliers", user.organizationId, supplierId);
      const [created] = await tx`insert into purchase_orders(organization_id,location_id,supplier_id,order_number,status,expected_delivery,notes,created_by) values(${user.organizationId},${locationId},${supplierId},${orderNumber},${status},${expectedDelivery},${notes},${user.userId}) returning *`;
      for (const item of items) {
        const productId = uuid(item?.productId, "productId");
        await requireOrganizationEntity(tx, "products", user.organizationId, productId);
        const quantity = Number(item?.quantity);
        const unitPrice = Number(item?.unitPrice);
        if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) throw new ApiError(400, "Order item quantity or price is invalid");
        await tx`insert into purchase_order_items(purchase_order_id,product_id,quantity,unit_price) values(${created.id},${productId},${quantity},${unitPrice})`;
      }
      await tx`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,after_data) values(${user.organizationId},${locationId},${user.userId},'ORDER_CREATED','purchase_order',${created.id},${JSON.stringify({ ...created, itemCount: items.length })}::jsonb)`;
      return created;
    });
    return NextResponse.json(purchaseOrder, { status: 201 });
  } catch (error) { return jsonError(error, request); }
}
