-- v0.8.5 PostgreSQL integrity and transaction completion.

alter table shifts
  add constraint shifts_recurrence_rule_fk
  foreign key (recurrence_group_id) references shift_recurrence_rules(id) on delete set null not valid;

alter table products add constraint products_purchase_price_nonnegative check (purchase_price >= 0) not valid;
alter table location_inventory add constraint location_inventory_quantity_nonnegative check (quantity >= 0) not valid;
alter table location_inventory add constraint location_inventory_par_nonnegative check (par_level >= 0) not valid;
alter table purchase_order_items add constraint purchase_order_items_quantity_positive check (quantity > 0) not valid;
alter table purchase_order_items add constraint purchase_order_items_price_nonnegative check (unit_price >= 0) not valid;
alter table goods_receipt_items add constraint goods_receipt_items_received_nonnegative check (received_quantity >= 0) not valid;
alter table goods_receipt_items add constraint goods_receipt_items_damaged_nonnegative check (damaged_quantity >= 0) not valid;
create unique index if not exists goods_receipt_item_once on goods_receipt_items(goods_receipt_id,purchase_order_item_id);
create unique index if not exists stock_transfer_item_once on stock_transfer_items(transfer_id,product_id);
create unique index if not exists one_open_break_per_timesheet on time_breaks(timesheet_id) where ended_at is null;

create or replace function assert_barops_tenant_integrity() returns trigger language plpgsql as $$
declare expected_org uuid; related_org uuid;
begin
  expected_org := null;
  if tg_table_name = 'location_inventory' then
    select organization_id into expected_org from locations where id=new.location_id;
    select organization_id into related_org from products where id=new.product_id;
  elsif tg_table_name = 'shifts' then
    select organization_id into related_org from locations where id=new.location_id;
    if related_org is distinct from new.organization_id then raise exception 'Shift location belongs to another organization'; end if;
    if new.employee_id is not null then select organization_id into related_org from employees where id=new.employee_id;
      if related_org is distinct from new.organization_id then raise exception 'Shift employee belongs to another organization'; end if; end if;
    return new;
  elsif tg_table_name = 'products' then
    expected_org := new.organization_id;
    if new.supplier_id is null then return new; end if;
    select organization_id into related_org from suppliers where id=new.supplier_id;
  elsif tg_table_name = 'purchase_orders' then
    expected_org := new.organization_id;
    select organization_id into related_org from locations where id=new.location_id;
    if related_org is distinct from new.organization_id then raise exception 'Order location belongs to another organization'; end if;
    select organization_id into related_org from suppliers where id=new.supplier_id;
  elsif tg_table_name = 'purchase_order_items' then
    select po.organization_id into expected_org from purchase_orders po where po.id=new.purchase_order_id;
    select organization_id into related_org from products where id=new.product_id;
  elsif tg_table_name = 'goods_receipts' then
    expected_org := new.organization_id;
    select organization_id into related_org from locations where id=new.location_id;
    if related_org is distinct from new.organization_id then raise exception 'Receipt location belongs to another organization'; end if;
    select organization_id into related_org from purchase_orders where id=new.purchase_order_id;
  elsif tg_table_name = 'goods_receipt_items' then
    select g.organization_id into expected_org from goods_receipts g where g.id=new.goods_receipt_id;
    select po.organization_id into related_org from purchase_order_items i join purchase_orders po on po.id=i.purchase_order_id where i.id=new.purchase_order_item_id;
  elsif tg_table_name = 'stock_transactions' then
    expected_org := new.organization_id;
    select organization_id into related_org from locations where id=new.location_id;
    if related_org is distinct from new.organization_id then raise exception 'Stock transaction location belongs to another organization'; end if;
    select organization_id into related_org from products where id=new.product_id;
  elsif tg_table_name = 'stock_transfers' then
    expected_org := new.organization_id;
    select organization_id into related_org from locations where id=new.from_location_id;
    if related_org is distinct from new.organization_id then raise exception 'Transfer source belongs to another organization'; end if;
    select organization_id into related_org from locations where id=new.to_location_id;
  elsif tg_table_name = 'stock_transfer_items' then
    select organization_id into expected_org from stock_transfers where id=new.transfer_id;
    select organization_id into related_org from products where id=new.product_id;
  elsif tg_table_name = 'waste_logs' then
    expected_org := new.organization_id;
    select organization_id into related_org from locations where id=new.location_id;
    if related_org is distinct from new.organization_id then raise exception 'Waste location belongs to another organization'; end if;
    select organization_id into related_org from products where id=new.product_id;
  else return new;
  end if;
  if expected_org is null or related_org is null or expected_org is distinct from related_org then
    raise exception 'Cross-organization relationship rejected for %', tg_table_name;
  end if;
  return new;
end $$;

create trigger tenant_guard_location_inventory before insert or update on location_inventory for each row execute function assert_barops_tenant_integrity();
create trigger tenant_guard_shifts before insert or update on shifts for each row execute function assert_barops_tenant_integrity();
create trigger tenant_guard_products before insert or update on products for each row execute function assert_barops_tenant_integrity();
create trigger tenant_guard_purchase_orders before insert or update on purchase_orders for each row execute function assert_barops_tenant_integrity();
create trigger tenant_guard_purchase_order_items before insert or update on purchase_order_items for each row execute function assert_barops_tenant_integrity();
create trigger tenant_guard_goods_receipts before insert or update on goods_receipts for each row execute function assert_barops_tenant_integrity();
create trigger tenant_guard_goods_receipt_items before insert or update on goods_receipt_items for each row execute function assert_barops_tenant_integrity();
create trigger tenant_guard_stock_transactions before insert or update on stock_transactions for each row execute function assert_barops_tenant_integrity();
create trigger tenant_guard_stock_transfers before insert or update on stock_transfers for each row execute function assert_barops_tenant_integrity();
create trigger tenant_guard_stock_transfer_items before insert or update on stock_transfer_items for each row execute function assert_barops_tenant_integrity();
create trigger tenant_guard_waste_logs before insert or update on waste_logs for each row execute function assert_barops_tenant_integrity();

create or replace function prevent_overlapping_payroll_periods() returns trigger language plpgsql as $$
begin
 if exists(select 1 from payroll_periods p where p.organization_id=new.organization_id and p.id<>new.id
   and p.location_id is not distinct from new.location_id and daterange(p.starts_on,p.ends_on,'[]') && daterange(new.starts_on,new.ends_on,'[]')) then
   raise exception 'Payroll period overlaps an existing period';
 end if;
 return new;
end $$;
create trigger payroll_period_overlap_guard before insert or update of starts_on,ends_on,location_id,organization_id on payroll_periods for each row execute function prevent_overlapping_payroll_periods();
