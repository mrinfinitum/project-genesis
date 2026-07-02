create table if not exists public.planet_render_library (
  id text primary key,
  name text not null,
  file_url text not null,
  storage_path text not null,
  thumbnail_url text default '',
  planet_class text default '',
  biome text default '',
  atmosphere text default '',
  climate text default '',
  color_family text default '',
  has_rings boolean default false,
  water_level text default '',
  cloud_level text default '',
  tags jsonb default '[]'::jsonb,
  hazards jsonb default '[]'::jsonb,
  traits jsonb default '[]'::jsonb,
  image_variants jsonb default '[]'::jsonb,
  rarity text default 'common',
  resolution integer default 4096,
  width integer default 4096,
  height integer default 4096,
  usage_count integer default 0,
  status text default 'Ready',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists planet_render_library_status_idx
  on public.planet_render_library(status);

create index if not exists planet_render_library_class_idx
  on public.planet_render_library(planet_class);

create index if not exists planet_render_library_biome_idx
  on public.planet_render_library(biome);

create index if not exists planet_render_library_rings_idx
  on public.planet_render_library(has_rings);

create index if not exists planet_render_library_usage_idx
  on public.planet_render_library(usage_count);
