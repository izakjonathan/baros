-- Production operations, payroll metadata, kiosk/geofence, procurement and security foundations.
alter table employees add column if not exists payroll_id text;
alter table employees add column if not exists salary_code text;
alter table employees add column if not exists cost_centre text;
alter table employees add column if not exists kiosk_pin_hash text;
alter table employees add column if not exists pin_failed_attempts integer not null default 0;
alter table employees add column if not exists pin_locked_until timestamptz;
create unique index if not exists employees_org_payroll_id_uq on employees(organization_id,payroll_id) where payroll_id is not null;

alter table locations add column if not exists latitude numeric(9,6);
alter table locations add column if not exists longitude numeric(9,6);
alter table locations add column if not exists clock_radius_meters integer not null default 150;

alter table payroll_periods add column if not exists closed_by uuid references users(id) on delete set null;
alter table payroll_periods add column if not exists closed_at timestamptz;
alter table payroll_periods drop constraint if exists payroll_periods_status_check;
alter table payroll_periods add constraint payroll_periods_status_check check(status in ('OPEN','LOCKED','EXPORTED','CLOSED'));

create table if not exists payroll_exports (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
 location_id uuid references locations(id) on delete set null, payroll_period_id uuid not null references payroll_periods(id) on delete restrict,
 created_by uuid references users(id) on delete set null, file_name text not null, file_sha256 text not null,
 row_count integer not null, employee_count integer not null, approved_minutes integer not null,
 included_timesheet_ids uuid[] not null default '{}', created_at timestamptz not null default now()
);
create index if not exists payroll_exports_org_idx on payroll_exports(organization_id,created_at desc);

create table if not exists schedule_templates (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
 location_id uuid not null references locations(id) on delete cascade, name text not null, description text,
 template jsonb not null default '[]'::jsonb, active boolean not null default true,
 created_by uuid references users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(location_id,name)
);

create table if not exists schedule_publications (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
 location_id uuid not null references locations(id) on delete cascade, week_start date not null,
 version integer not null default 1, published_by uuid references users(id) on delete set null, published_at timestamptz not null default now(),
 unique(location_id,week_start,version)
);
create table if not exists schedule_acknowledgements (
 publication_id uuid not null references schedule_publications(id) on delete cascade,
 employee_id uuid not null references employees(id) on delete cascade, acknowledged_at timestamptz not null default now(),
 primary key(publication_id,employee_id)
);

create table if not exists attendance_alerts (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
 location_id uuid not null references locations(id) on delete cascade, employee_id uuid not null references employees(id) on delete cascade,
 shift_id uuid references shifts(id) on delete set null, timesheet_id uuid references timesheets(id) on delete set null,
 alert_type text not null check(alert_type in ('LATE','MISSED_CLOCK_OUT','EARLY_CLOCK_IN','GEOFENCE','UNSCHEDULED','LONG_SHIFT')),
 severity text not null default 'WARNING' check(severity in ('INFO','WARNING','CRITICAL')), message text not null,
 resolved_at timestamptz, resolved_by uuid references users(id) on delete set null, created_at timestamptz not null default now()
);
create index if not exists attendance_alerts_open_idx on attendance_alerts(organization_id,resolved_at,created_at desc);

create table if not exists labour_forecasts (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
 location_id uuid not null references locations(id) on delete cascade, forecast_date date not null,
 revenue_forecast numeric(12,2) not null default 0, labour_budget numeric(12,2) not null default 0,
 target_labour_percent numeric(6,2), expected_guests integer, notes text,
 created_by uuid references users(id) on delete set null, updated_at timestamptz not null default now(), unique(location_id,forecast_date)
);

create table if not exists goods_receipts (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
 location_id uuid not null references locations(id) on delete cascade, purchase_order_id uuid not null references purchase_orders(id) on delete restrict,
 delivery_note_number text, invoice_number text, invoice_total numeric(12,2), received_by uuid references users(id) on delete set null,
 received_at timestamptz not null default now(), status text not null default 'RECEIVED' check(status in ('RECEIVED','PARTIAL','DISPUTED','MATCHED')),
 discrepancy_note text, created_at timestamptz not null default now()
);
create table if not exists goods_receipt_items (
 id uuid primary key default gen_random_uuid(), goods_receipt_id uuid not null references goods_receipts(id) on delete cascade,
 purchase_order_item_id uuid not null references purchase_order_items(id) on delete restrict,
 received_quantity numeric(12,3) not null, damaged_quantity numeric(12,3) not null default 0,
 invoiced_quantity numeric(12,3), invoiced_unit_price numeric(12,2)
);

create table if not exists stock_transactions (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
 location_id uuid not null references locations(id) on delete cascade, product_id uuid not null references products(id) on delete restrict,
 transaction_type text not null check(transaction_type in ('RECEIPT','WASTE','TRANSFER_OUT','TRANSFER_IN','COUNT_ADJUSTMENT','MANUAL')),
 quantity numeric(12,3) not null, unit_cost numeric(12,2), reference_type text, reference_id uuid,
 reason text, created_by uuid references users(id) on delete set null, created_at timestamptz not null default now()
);
create index if not exists stock_transactions_ledger_idx on stock_transactions(location_id,product_id,created_at desc);

create table if not exists stock_transfers (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
 from_location_id uuid not null references locations(id) on delete restrict, to_location_id uuid not null references locations(id) on delete restrict,
 status text not null default 'DRAFT' check(status in ('DRAFT','IN_TRANSIT','RECEIVED','CANCELLED')),
 created_by uuid references users(id) on delete set null, sent_at timestamptz, received_at timestamptz, notes text, created_at timestamptz not null default now(),
 check(from_location_id <> to_location_id)
);
create table if not exists stock_transfer_items (
 id uuid primary key default gen_random_uuid(), transfer_id uuid not null references stock_transfers(id) on delete cascade,
 product_id uuid not null references products(id) on delete restrict, quantity numeric(12,3) not null check(quantity>0)
);

create table if not exists waste_logs (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
 location_id uuid not null references locations(id) on delete cascade, product_id uuid not null references products(id) on delete restrict,
 quantity numeric(12,3) not null check(quantity>0), reason text not null,
 recorded_by uuid references users(id) on delete set null, occurred_at timestamptz not null default now(), created_at timestamptz not null default now()
);

create table if not exists mfa_factors (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade,
 factor_type text not null check(factor_type in ('TOTP','RECOVERY')), secret_ciphertext text, enabled_at timestamptz,
 last_used_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists password_reset_tokens (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade,
 token_hash text not null unique, expires_at timestamptz not null, used_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists rate_limit_buckets (
 key text primary key, count integer not null default 0, window_started_at timestamptz not null default now(), expires_at timestamptz not null
);
create table if not exists gdpr_requests (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
 user_id uuid references users(id) on delete set null, employee_id uuid references employees(id) on delete set null,
 request_type text not null check(request_type in ('EXPORT','DELETE','RECTIFY')), status text not null default 'OPEN' check(status in ('OPEN','PROCESSING','COMPLETED','REJECTED')),
 requested_at timestamptz not null default now(), completed_at timestamptz, handled_by uuid references users(id) on delete set null, notes text
);
create table if not exists system_health_events (
 id bigserial primary key, organization_id uuid references organizations(id) on delete cascade,
 level text not null check(level in ('INFO','WARNING','ERROR')), source text not null, message text not null,
 metadata jsonb, created_at timestamptz not null default now()
);
