alter table organization_ui_themes
  add column if not exists accent_color text not null default '#bb533f' check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  add column if not exists positive_color text not null default '#78a353' check (positive_color ~ '^#[0-9A-Fa-f]{6}$');
