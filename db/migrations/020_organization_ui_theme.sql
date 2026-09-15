create table organization_ui_themes (
  organization_id uuid primary key references organizations(id) on delete cascade,
  canvas_color text not null default '#fff4c4' check (canvas_color ~ '^#[0-9A-Fa-f]{6}$'),
  ink_color text not null default '#000000' check (ink_color ~ '^#[0-9A-Fa-f]{6}$'),
  updated_by uuid references users(id) on delete set null,
  updated_at timestamptz not null default now(),
  check (canvas_color <> ink_color)
);
