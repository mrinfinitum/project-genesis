create table if not exists public.planet_resource_profiles (
  id text primary key,
  planet_class text not null,
  subclass text not null,
  discovery_tier text,
  colonizable text,
  mining_difficulty integer default 0,
  resource_density text,
  planet_rarity_bias text,
  guaranteed_resources jsonb default '[]'::jsonb,
  common_resources jsonb default '[]'::jsonb,
  rare_resources jsonb default '[]'::jsonb,
  exotic_resources jsonb default '[]'::jsonb,
  scientific_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (planet_class, subclass)
);

create index if not exists planet_resource_profiles_class_idx
  on public.planet_resource_profiles(planet_class);

create index if not exists planet_resource_profiles_subclass_idx
  on public.planet_resource_profiles(subclass);

create index if not exists planet_resource_profiles_tier_idx
  on public.planet_resource_profiles(discovery_tier);
