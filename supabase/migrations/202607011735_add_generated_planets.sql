create table if not exists public.generated_planets (
  id text primary key,
  seed text not null,
  name text not null,
  galaxy_sector text,
  star_system text,
  orbit_position integer default 0,
  discovery_order integer default 0,
  star_type text,
  distance_from_star text,
  orbit_speed text,
  planet_class text,
  primary_biome text,
  climate text,
  atmosphere text,
  temperature text,
  gravity text,
  water_coverage text,
  moons text,
  resources jsonb default '[]'::jsonb,
  flora text,
  fauna text,
  ancient_civilization text,
  ruins text,
  hazards jsonb default '[]'::jsonb,
  traits jsonb default '[]'::jsonb,
  modifiers jsonb default '[]'::jsonb,
  collectible_pools jsonb default '[]'::jsonb,
  visual_theme jsonb default '{}'::jsonb,
  weather jsonb default '[]'::jsonb,
  colonization jsonb default '{}'::jsonb,
  science jsonb default '{}'::jsonb,
  economy jsonb default '{}'::jsonb,
  event_pool jsonb default '[]'::jsonb,
  story text,
  colonized boolean default false,
  terraform_level integer default 0,
  discovery_points integer default 0,
  completion_percent integer default 0,
  created_at timestamptz default now(),
  notes text
);

create index if not exists generated_planets_created_at_idx
  on public.generated_planets(created_at desc);

create index if not exists generated_planets_class_idx
  on public.generated_planets(planet_class);
