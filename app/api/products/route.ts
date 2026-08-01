// Location inheritance compatibility: b.locationId?uuid(b.locationId,'locationId'):u.locationId
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, finiteNumber, jsonError, optionalString, readJsonObject, requiredString, uuid } from "@/lib/http";

function forbidden(user: Awaited<ReturnType<typeof getSessionUser>>) {
  return !user || user.role === "EMPLOYEE";
}

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const requested = new URL(req.url).searchParams.get("locationId");
    const locationId = requested ? uuid(requested, "locationId") : user.locationId;
    if (!locationId) throw new ApiError(400, "No active location is configured");
    const rows = await db()`
      select p.*, s.name supplier, li.quantity, li.par_level, li.reorder_level
      from products p
      left join suppliers s on s.id=p.supplier_id and s.organization_id=p.organization_id
      left join location_inventory li on li.product_id=p.id and li.location_id=${locationId}
      where p.organization_id=${user.organizationId}
      order by p.active desc, p.name`;
    return NextResponse.json(rows);
  } catch (error) { return jsonError(error); }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (forbidden(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await readJsonObject(req);
    const locationId = body.locationId ? uuid(body.locationId, "locationId") : user!.locationId;
    if (!locationId) throw new ApiError(400, "No active location is configured");
    const supplierId = body.supplierId ? uuid(body.supplierId, "supplierId") : null;
    const name = requiredString(body, "name", 160);
    const category = requiredString(body, "category", 100);
    const unit = requiredString(body, "unit", 50);
    const sku = optionalString(body, "sku", 100);
    const price = finiteNumber(body.price ?? 0, "price", { min: 0, max: 1_000_000 });
    const stock = finiteNumber(body.stock ?? 0, "stock", { min: 0, max: 1_000_000 });
    const par = finiteNumber(body.par ?? 0, "par", { min: 0, max: 1_000_000 });
    const reorder = body.reorderLevel == null ? null : finiteNumber(body.reorderLevel, "reorderLevel", { min: 0, max: 1_000_000 });

    const result = await db().begin(async tx => {
      const [location] = await tx`select id from locations where id=${locationId} and organization_id=${user!.organizationId} and active for share`;
      if (!location) throw new ApiError(400, "Location does not belong to this organization");
      if (supplierId) {
        const [supplier] = await tx`select id from suppliers where id=${supplierId} and organization_id=${user!.organizationId} and active for share`;
        if (!supplier) throw new ApiError(400, "Supplier does not belong to this organization");
      }
      const [product] = await tx`
        insert into products(organization_id,supplier_id,sku,name,category,unit,purchase_price)
        values(${user!.organizationId},${supplierId},${sku},${name},${category},${unit},${price}) returning *`;
      await tx`
        insert into location_inventory(location_id,product_id,quantity,par_level,reorder_level)
        values(${locationId},${product.id},${stock},${par},${reorder})`;
      await tx`
        insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,after_data)
        values(${user!.organizationId},${locationId},${user!.userId},'PRODUCT_CREATED','product',${product.id},${JSON.stringify(product)}::jsonb)`;
      return product;
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error?.code === "23505") return NextResponse.json({ error: "A product with this name already exists" }, { status: 409 });
    return jsonError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser();
    if (forbidden(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await readJsonObject(req);
    const id = uuid(body.id, "id");
    const locationId = body.locationId ? uuid(body.locationId, "locationId") : user!.locationId;
    const quantity = body.quantity == null ? null : finiteNumber(body.quantity, "quantity", { min: 0, max: 1_000_000 });
    const par = body.par == null ? null : finiteNumber(body.par, "par", { min: 0, max: 1_000_000 });
    const reorder = body.reorderLevel == null ? null : finiteNumber(body.reorderLevel, "reorderLevel", { min: 0, max: 1_000_000 });
    if ((quantity != null || par != null || reorder != null) && !locationId) throw new ApiError(400, "No active location is configured");
    const supplierId = body.supplierId === null ? null : body.supplierId ? uuid(body.supplierId, "supplierId") : undefined;

    const result = await db().begin(async tx => {
      const [before] = await tx`select * from products where id=${id} and organization_id=${user!.organizationId} for update`;
      if (!before) throw new ApiError(404, "Product not found");
      if (locationId) {
        const [location] = await tx`select id from locations where id=${locationId} and organization_id=${user!.organizationId} and active for share`;
        if (!location) throw new ApiError(400, "Location does not belong to this organization");
      }
      if (supplierId) {
        const [supplier] = await tx`select id from suppliers where id=${supplierId} and organization_id=${user!.organizationId} and active for share`;
        if (!supplier) throw new ApiError(400, "Supplier does not belong to this organization");
      }
      const [product] = await tx`
        update products set
          name=coalesce(${body.name == null ? null : requiredString(body,"name",160)},name),
          category=coalesce(${body.category == null ? null : requiredString(body,"category",100)},category),
          unit=coalesce(${body.unit == null ? null : requiredString(body,"unit",50)},unit),
          purchase_price=coalesce(${body.price == null ? null : finiteNumber(body.price,"price",{min:0,max:1_000_000})},purchase_price),
          supplier_id=case when ${supplierId !== undefined} then ${supplierId ?? null} else supplier_id end,
          sku=case when ${body.sku !== undefined} then ${optionalString(body,"sku",100)} else sku end,
          active=coalesce(${typeof body.active === "boolean" ? body.active : null},active)
        where id=${id} and organization_id=${user!.organizationId} returning *`;
      if (locationId && (quantity != null || par != null || reorder != null)) {
        await tx`
          insert into location_inventory(location_id,product_id,quantity,par_level,reorder_level)
          values(${locationId},${id},${quantity ?? 0},${par ?? 0},${reorder})
          on conflict(location_id,product_id) do update set
            quantity=coalesce(${quantity},location_inventory.quantity),
            par_level=coalesce(${par},location_inventory.par_level),
            reorder_level=case when ${body.reorderLevel !== undefined} then ${reorder} else location_inventory.reorder_level end,
            updated_at=now()`;
      }
      await tx`
        insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,before_data,after_data)
        values(${user!.organizationId},${locationId ?? null},${user!.userId},'PRODUCT_UPDATED','product',${id},${JSON.stringify(before)}::jsonb,${JSON.stringify(product)}::jsonb)`;
      return product;
    });
    return NextResponse.json(result);
  } catch (error: any) {
    if (error?.code === "23505") return NextResponse.json({ error: "A product with this name already exists" }, { status: 409 });
    return jsonError(error);
  }
}
