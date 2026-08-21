import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, enumValue, finiteNumber, jsonError, objectArray, optionalString, readJsonObject, requiredString, uuid } from "@/lib/http";

export async function GET(req: Request) {
  try {
    const user = await requireCapability("operations.read");
    const params = new URL(req.url).searchParams;
    const type = params.get("type");
    const locationId = params.get("locationId") || user.locationId;
    if (type === "receipts") return NextResponse.json(await db()`select g.*,po.order_number,s.name supplier from goods_receipts g join purchase_orders po on po.id=g.purchase_order_id join suppliers s on s.id=po.supplier_id where g.organization_id=${user.organizationId} and (${locationId}::uuid is null or g.location_id=${locationId}) order by g.received_at desc`);
    if (type === "waste") return NextResponse.json(await db()`select w.*,p.name product from waste_logs w join products p on p.id=w.product_id where w.organization_id=${user.organizationId} and (${locationId}::uuid is null or w.location_id=${locationId}) order by w.occurred_at desc`);
    if (type === "transfers") return NextResponse.json(await db()`select t.*,a.name from_location,b.name to_location from stock_transfers t join locations a on a.id=t.from_location_id join locations b on b.id=t.to_location_id where t.organization_id=${user.organizationId} order by t.created_at desc`);
    throw new ApiError(400, "type is required");
  } catch (error) { return jsonError(error, req); }
}

export async function POST(req: Request) {
  try {
    const user = await requireCapability("operations.manage");
    const body = await readJsonObject(req, 128_000);
    const type = enumValue(body.type, "type", ["WASTE","TRANSFER","RECEIPT"] as const);
    const result = await db().begin(async tx => {
      if (type === "WASTE") {
        const locationId = uuid(body.locationId || user.locationId, "locationId");
        const productId = uuid(body.productId, "productId");
        const quantity = finiteNumber(body.quantity, "quantity", { min: 0.001, max: 1_000_000 });
        const reason = requiredString(body, "reason", 500);
        const [inventory] = await tx`
          select li.quantity from location_inventory li
          join locations l on l.id=li.location_id
          join products p on p.id=li.product_id
          where li.location_id=${locationId} and li.product_id=${productId}
            and l.organization_id=${user.organizationId} and p.organization_id=${user.organizationId}
          for update`;
        if (!inventory) throw new ApiError(404, "Inventory record not found");
        if (Number(inventory.quantity) < quantity) throw new ApiError(409, "Waste quantity exceeds available stock");
        const [waste] = await tx`insert into waste_logs(organization_id,location_id,product_id,quantity,reason,recorded_by) values(${user.organizationId},${locationId},${productId},${quantity},${reason},${user.userId}) returning *`;
        await tx`update location_inventory set quantity=quantity-${quantity},updated_at=now() where location_id=${locationId} and product_id=${productId}`;
        await tx`insert into stock_transactions(organization_id,location_id,product_id,transaction_type,quantity,reference_type,reference_id,reason,created_by) values(${user.organizationId},${locationId},${productId},'WASTE',${-quantity},'waste_log',${waste.id},${reason},${user.userId})`;
        await tx`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,after_data) values(${user.organizationId},${locationId},${user.userId},'WASTE_POSTED','waste_log',${waste.id},${JSON.stringify(waste)}::jsonb)`;
        return waste;
      }

      if (type === "RECEIPT") {
        const locationId = uuid(body.locationId || user.locationId, "locationId");
        const purchaseOrderId = uuid(body.purchaseOrderId, "purchaseOrderId");
        const items = objectArray(body.items, "items", 250);
        if (!items.length) throw new ApiError(400, "At least one receipt item is required");
        const [order] = await tx`select * from purchase_orders where id=${purchaseOrderId} and organization_id=${user.organizationId} and location_id=${locationId} and status not in ('DELIVERED','CANCELLED') for update`;
        if (!order) throw new ApiError(404, "Open purchase order not found for this location");
        const receiptStatus = enumValue(body.status || "RECEIVED", "status", ["RECEIVED","PARTIAL","DISPUTED","MATCHED"] as const);
        const [receipt] = await tx`insert into goods_receipts(organization_id,location_id,purchase_order_id,delivery_note_number,invoice_number,invoice_total,received_by,status,discrepancy_note) values(${user.organizationId},${locationId},${purchaseOrderId},${optionalString(body,"deliveryNote",120)},${optionalString(body,"invoiceNumber",120)},${body.invoiceTotal == null ? null : finiteNumber(body.invoiceTotal,"invoiceTotal",{min:0,max:10_000_000})},${user.userId},${receiptStatus},${optionalString(body,"discrepancyNote",1000)}) returning *`;
        for (const item of items) {
          const itemId = uuid(item.purchaseOrderItemId, "purchaseOrderItemId");
          const received = finiteNumber(item.receivedQuantity, "receivedQuantity", { min: 0, max: 1_000_000 });
          const damaged = finiteNumber(item.damagedQuantity ?? 0, "damagedQuantity", { min: 0, max: received });
          const accepted = received - damaged;
          const [orderItem] = await tx`select i.*,p.organization_id from purchase_order_items i join products p on p.id=i.product_id where i.id=${itemId} and i.purchase_order_id=${purchaseOrderId} and p.organization_id=${user.organizationId} for update`;
          if (!orderItem) throw new ApiError(400, "Receipt item does not belong to this purchase order");
          await tx`insert into goods_receipt_items(goods_receipt_id,purchase_order_item_id,received_quantity,damaged_quantity,invoiced_quantity,invoiced_unit_price) values(${receipt.id},${itemId},${received},${damaged},${item.invoicedQuantity == null ? null : finiteNumber(item.invoicedQuantity,"invoicedQuantity",{min:0,max:1_000_000})},${item.invoicedUnitPrice == null ? null : finiteNumber(item.invoicedUnitPrice,"invoicedUnitPrice",{min:0,max:1_000_000})})`;
          await tx`update purchase_order_items set received_quantity=received_quantity+${accepted} where id=${itemId}`;
          if (accepted > 0) {
            await tx`insert into location_inventory(location_id,product_id,quantity,par_level) values(${locationId},${orderItem.product_id},${accepted},0) on conflict(location_id,product_id) do update set quantity=location_inventory.quantity+${accepted},updated_at=now()`;
            await tx`insert into stock_transactions(organization_id,location_id,product_id,transaction_type,quantity,unit_cost,reference_type,reference_id,reason,created_by) values(${user.organizationId},${locationId},${orderItem.product_id},'RECEIPT',${accepted},${orderItem.unit_price},'goods_receipt',${receipt.id},'Delivery received',${user.userId})`;
          }
        }
        const [remaining] = await tx`select count(*)::int pending from purchase_order_items where purchase_order_id=${purchaseOrderId} and received_quantity < quantity`;
        await tx`update purchase_orders set status=${Number(remaining.pending) === 0 ? "DELIVERED" : "CONFIRMED"} where id=${purchaseOrderId}`;
        await tx`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,after_data) values(${user.organizationId},${locationId},${user.userId},'DELIVERY_RECEIVED','goods_receipt',${receipt.id},${JSON.stringify(receipt)}::jsonb)`;
        return receipt;
      }

      const fromLocationId = uuid(body.fromLocationId, "fromLocationId");
      const toLocationId = uuid(body.toLocationId, "toLocationId");
      if (fromLocationId === toLocationId) throw new ApiError(400, "Source and destination locations must differ");
      const items = objectArray(body.items, "items", 250);
      if (!items.length) throw new ApiError(400, "At least one transfer item is required");
      const status = enumValue(body.status || "RECEIVED", "status", ["DRAFT","IN_TRANSIT","RECEIVED"] as const);
      const locations = await tx`select id from locations where id in (${fromLocationId},${toLocationId}) and organization_id=${user.organizationId} and active for share`;
      if (locations.length !== 2) throw new ApiError(400, "Both transfer locations must belong to this organization");
      const [transfer] = await tx`insert into stock_transfers(organization_id,from_location_id,to_location_id,status,created_by,sent_at,received_at,notes) values(${user.organizationId},${fromLocationId},${toLocationId},${status},${user.userId},${status === "DRAFT" ? null : new Date()},${status === "RECEIVED" ? new Date() : null},${optionalString(body,"notes",1000)}) returning *`;
      for (const item of items) {
        const productId = uuid(item.productId, "productId");
        const quantity = finiteNumber(item.quantity, "quantity", { min: 0.001, max: 1_000_000 });
        const [source] = await tx`select li.quantity from location_inventory li join products p on p.id=li.product_id where li.location_id=${fromLocationId} and li.product_id=${productId} and p.organization_id=${user.organizationId} for update`;
        if (!source || Number(source.quantity) < quantity) throw new ApiError(409, "Insufficient source stock for transfer");
        await tx`insert into stock_transfer_items(transfer_id,product_id,quantity) values(${transfer.id},${productId},${quantity})`;
        if (status !== "DRAFT") {
          await tx`update location_inventory set quantity=quantity-${quantity},updated_at=now() where location_id=${fromLocationId} and product_id=${productId}`;
          await tx`insert into stock_transactions(organization_id,location_id,product_id,transaction_type,quantity,reference_type,reference_id,reason,created_by) values(${user.organizationId},${fromLocationId},${productId},'TRANSFER_OUT',${-quantity},'stock_transfer',${transfer.id},'Stock transfer sent',${user.userId})`;
        }
        if (status === "RECEIVED") {
          await tx`insert into location_inventory(location_id,product_id,quantity,par_level) values(${toLocationId},${productId},${quantity},0) on conflict(location_id,product_id) do update set quantity=location_inventory.quantity+${quantity},updated_at=now()`;
          await tx`insert into stock_transactions(organization_id,location_id,product_id,transaction_type,quantity,reference_type,reference_id,reason,created_by) values(${user.organizationId},${toLocationId},${productId},'TRANSFER_IN',${quantity},'stock_transfer',${transfer.id},'Stock transfer received',${user.userId})`;
        }
      }
      await tx`insert into audit_logs(organization_id,actor_user_id,action,entity_type,entity_id,after_data) values(${user.organizationId},${user.userId},'STOCK_TRANSFER_POSTED','stock_transfer',${transfer.id},${JSON.stringify(transfer)}::jsonb)`;
      return transfer;
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) { return jsonError(error, req); }
}
