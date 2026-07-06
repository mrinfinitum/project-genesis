create table if not exists public.resource_catalog (
  id text primary key,
  resource_name text not null,
  category text,
  rarity text,
  rarity_color text,
  discovery_tier text,
  earth_available text,
  first_unlock_requirement text,
  typical_planet_classes jsonb default '[]'::jsonb,
  primary_uses jsonb default '[]'::jsonb,
  base_trade_value integer default 0,
  stack_size integer default 0,
  description text,
  science_lore_notes text,
  codex_implementation_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists resource_catalog_category_idx
  on public.resource_catalog(category);

create index if not exists resource_catalog_rarity_idx
  on public.resource_catalog(rarity);

create index if not exists resource_catalog_discovery_tier_idx
  on public.resource_catalog(discovery_tier);

create index if not exists resource_catalog_earth_available_idx
  on public.resource_catalog(earth_available);
