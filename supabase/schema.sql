create extension if not exists pgcrypto;

create table if not exists research_branches (
  id text primary key,
  name text not null,
  purpose text
);

create table if not exists research (
  id text primary key,
  branch_id text references research_branches(id) on delete set null,
  era text,
  era_order integer default 0,
  node_order integer default 0,
  name text not null,
  design_purpose text,
  primary_unlock_type text,
  unlocks jsonb default '[]'::jsonb,
  gameplay_effect text,
  prerequisite_id text references research(id) on delete set null,
  cost_experimental integer default 0,
  research_time text,
  related_systems jsonb default '[]'::jsonb,
  icon_name text,
  asset_id text,
  status text default 'Draft',
  notes text
);

create table if not exists districts (
  id text primary key,
  name text not null,
  purpose text,
  primary_buildings jsonb default '[]'::jsonb,
  primary_stat text,
  bonus text,
  unlock_research text,
  civilization text,
  priority integer default 0
);

create table if not exists assets (
  id text primary key,
  name text not null,
  type text,
  category text,
  prompt text,
  file_url text,
  source_file_url text,
  source_file_type text,
  parent_asset_id text references assets(id) on delete set null,
  slice_name text,
  roblox_asset_id text,
  export_status text,
  status text default 'Draft',
  notes text
);

create table if not exists conceptual_art (
  id text primary key,
  name text not null,
  category text,
  description text,
  file_url text not null,
  file_name text,
  file_type text,
  file_size bigint default 0,
  storage_path text,
  preview_url text,
  preview_storage_path text,
  status text default 'Uploaded',
  notes text,
  created_at timestamptz default now()
);

create table if not exists planets (
  id text primary key,
  category text not null,
  value text not null,
  description text,
  generation_rule text,
  frequency text,
  weight numeric default 0,
  min_value numeric default 0,
  max_value numeric default 0,
  biome_tags jsonb default '[]'::jsonb,
  resource_tags jsonb default '[]'::jsonb,
  status text default 'Draft',
  notes text
);

create table if not exists planet_resource_profiles (
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
  on planet_resource_profiles(planet_class);

create index if not exists planet_resource_profiles_subclass_idx
  on planet_resource_profiles(subclass);

create index if not exists planet_resource_profiles_tier_idx
  on planet_resource_profiles(discovery_tier);

create table if not exists resource_catalog (
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
  on resource_catalog(category);

create index if not exists resource_catalog_rarity_idx
  on resource_catalog(rarity);

create index if not exists resource_catalog_discovery_tier_idx
  on resource_catalog(discovery_tier);

create index if not exists resource_catalog_earth_available_idx
  on resource_catalog(earth_available);

create table if not exists universes (
  id text primary key,
  universe_seed text not null unique,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists galaxies (
  id text primary key,
  universe_id text references universes(id) on delete cascade,
  galaxy_seed text not null unique,
  name text not null,
  galaxy_type text not null,
  sector_count integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists sectors (
  id text primary key,
  galaxy_id text references galaxies(id) on delete cascade,
  sector_seed text not null unique,
  coordinates_x integer not null default 0,
  coordinates_y integer not null default 0,
  coordinates_z integer not null default 0,
  system_count integer not null default 0,
  discovered boolean not null default false,
  discovered_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists star_systems (
  id text primary key,
  sector_id text references sectors(id) on delete cascade,
  system_seed text not null unique,
  system_name text not null,
  catalog_designation text not null,
  system_rarity text not null,
  star_count integer not null default 1,
  planet_count integer not null default 0,
  resource_bias text not null default 'Balanced',
  danger_level integer not null default 0,
  discovered boolean not null default false,
  discovered_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists stars (
  id text primary key,
  system_id text references star_systems(id) on delete cascade,
  star_seed text not null unique,
  star_name text not null,
  star_type text not null,
  star_size text not null,
  star_temperature integer not null default 0,
  star_color text not null,
  luminosity integer not null default 0,
  age text not null,
  created_at timestamptz default now()
);

create table if not exists universe_planets (
  id text primary key,
  system_id text references star_systems(id) on delete cascade,
  planet_seed text not null unique,
  planet_name text not null,
  orbit_position integer not null default 0,
  planet_rarity text not null default 'Common',
  planet_class text not null,
  planet_subclass text not null,
  discovered boolean not null default false,
  discovered_at timestamptz,
  renamed_to text,
  colonized boolean not null default false,
  terraform_level integer not null default 0,
  resources_mined jsonb not null default '{}'::jsonb,
  buildings_built jsonb not null default '[]'::jsonb,
  collectibles_found jsonb not null default '[]'::jsonb,
  expeditions_completed jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists generated_planets (
  id text primary key,
  seed text not null,
  name text not null,
  galaxy_sector text,
  star_system text,
  orbit_position integer default 0,
  discovery_order integer default 0,
  rarity text default 'Common',
  star_type text,
  distance_from_star text,
  orbit_speed text,
  planet_class text,
  planet_subclass text,
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
  anomalies jsonb default '[]'::jsonb,
  modifiers jsonb default '[]'::jsonb,
  collectible_pools jsonb default '[]'::jsonb,
  visual_theme jsonb default '{}'::jsonb,
  weather jsonb default '[]'::jsonb,
  colonization jsonb default '{}'::jsonb,
  science jsonb default '{}'::jsonb,
  economy jsonb default '{}'::jsonb,
  event_pool jsonb default '[]'::jsonb,
  story text,
  colonizable boolean default true,
  landable boolean default true,
  surface_exploration boolean default true,
  terrain_generation boolean default true,
  uses_orbital_gameplay boolean default false,
  orbital_slot_count integer default 0,
  orbital_platforms_built jsonb default '[]'::jsonb,
  atmospheric_harvest_rate integer default 0,
  gas_giant_hazard_level integer default 0,
  required_technology jsonb default '[]'::jsonb,
  resource_transport_options jsonb default '[]'::jsonb,
  colonized boolean default false,
  terraform_level integer default 0,
  discovery_points integer default 0,
  completion_percent integer default 0,
  image_url text,
  image_prompt text,
  image_status text default 'Not Rendered',
  image_variants jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  notes text
);

alter table generated_planets add column if not exists image_url text;
alter table generated_planets add column if not exists image_prompt text;
alter table generated_planets add column if not exists image_status text default 'Not Rendered';
alter table generated_planets add column if not exists image_variants jsonb default '[]'::jsonb;
alter table generated_planets add column if not exists rarity text default 'Common';
alter table generated_planets add column if not exists planet_subclass text;
alter table generated_planets add column if not exists anomalies jsonb default '[]'::jsonb;
alter table generated_planets add column if not exists colonizable boolean default true;
alter table generated_planets add column if not exists landable boolean default true;
alter table generated_planets add column if not exists surface_exploration boolean default true;
alter table generated_planets add column if not exists terrain_generation boolean default true;
alter table generated_planets add column if not exists uses_orbital_gameplay boolean default false;
alter table generated_planets add column if not exists orbital_slot_count integer default 0;
alter table generated_planets add column if not exists orbital_platforms_built jsonb default '[]'::jsonb;
alter table generated_planets add column if not exists atmospheric_harvest_rate integer default 0;
alter table generated_planets add column if not exists gas_giant_hazard_level integer default 0;
alter table generated_planets add column if not exists required_technology jsonb default '[]'::jsonb;
alter table generated_planets add column if not exists resource_transport_options jsonb default '[]'::jsonb;

create table if not exists planet_classes (
  planet_class text primary key,
  landable boolean not null default true,
  colonizable boolean not null default true,
  uses_surface_generation boolean not null default true,
  uses_orbital_gameplay boolean not null default false,
  default_interaction_type text not null default 'Surface Exploration',
  notes text default ''
);

insert into planet_classes (
  planet_class,
  landable,
  colonizable,
  uses_surface_generation,
  uses_orbital_gameplay,
  default_interaction_type,
  notes
)
values
  ('Gas Giant', false, false, false, true, 'Orbital Harvesting', 'Non-landable orbital resource world using stations, platforms, harvesters, and refineries.')
on conflict (planet_class) do update set
  landable = excluded.landable,
  colonizable = excluded.colonizable,
  uses_surface_generation = excluded.uses_surface_generation,
  uses_orbital_gameplay = excluded.uses_orbital_gameplay,
  default_interaction_type = excluded.default_interaction_type,
  notes = excluded.notes;

create table if not exists planet_render_library (
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

alter table assets add column if not exists source_file_url text;
alter table assets add column if not exists source_file_type text;
alter table assets add column if not exists parent_asset_id text references assets(id) on delete set null;
alter table assets add column if not exists slice_name text;
alter table assets add column if not exists export_status text;

alter table research add column if not exists asset_id text references assets(id) on delete set null;
do $$
begin
  alter table research
    add constraint research_asset_id_fkey
    foreign key (asset_id)
    references assets(id)
    on delete set null;
exception
  when duplicate_object then null;
end $$;

create table if not exists buildings (
  id text primary key,
  era text,
  civilization text,
  category text,
  name text not null,
  description text,
  cost_credits numeric default 0,
  cost_labor numeric default 0,
  cost_experimental numeric default 0,
  construction_time text,
  income_credits_sec numeric default 0,
  income_labor_sec numeric default 0,
  income_experimental_sec numeric default 0,
  population_bonus numeric default 0,
  labor_requirement numeric default 0,
  building_size text,
  district_id text references districts(id) on delete set null,
  unlock_research_id text references research(id) on delete set null,
  unlock_building text,
  visual_evolution text,
  upgrade_chain text,
  wonder text,
  icon_name text,
  model_name text,
  asset_id text references assets(id) on delete set null,
  notes text
);

create table if not exists unlock_matrix (
  id text primary key,
  source_type text,
  source_id text,
  source_name text,
  source_branch text,
  source_era text,
  unlock_type text,
  unlock_name text,
  unlock_id text,
  implementation_status text default 'Draft',
  notes text
);

create table if not exists wonders (
  id text primary key,
  name text not null,
  civilization text,
  unlock_research_id text references research(id) on delete set null,
  civilization_id text,
  primary_bonus_type text,
  bonuses jsonb default '[]'::jsonb,
  requirements jsonb default '[]'::jsonb,
  construction_cost text,
  construction_time text,
  icon_name text,
  model_name text,
  status text default 'Draft',
  notes text
);

create table if not exists release_notes (
  id text primary key,
  version text not null,
  release_name text,
  purpose text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists upgrades (
  id text primary key,
  type text,
  civilization text,
  era text,
  name text not null,
  tier text,
  max_level integer default 0,
  unlock_level integer default 0,
  cost_resource text,
  base_cost numeric default 0,
  cost_multiplier numeric default 0,
  bonus_type text,
  bonus_value text,
  description text,
  icon_name text,
  asset_id text references assets(id) on delete set null,
  notes text
);

alter table upgrades add column if not exists type text;
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'upgrades'
      and column_name = 'tab'
  ) then
    execute 'update upgrades set type = tab where type is null and tab is not null';
  end if;
end $$;

create table if not exists building_relationships (
  id text primary key,
  building_id text references buildings(id) on delete cascade,
  building text,
  era text,
  civilization text,
  category text,
  district_id text references districts(id) on delete set null,
  district text,
  chain_id text,
  unlock_research text,
  unlock_research_id text references research(id) on delete set null,
  primary_upgrade_dependency text,
  primary_upgrade_id text references upgrades(id) on delete set null,
  wonder_id text references wonders(id) on delete set null,
  implementation_status text default 'Needs ID Mapping',
  notes text
);

create table if not exists building_chains (
  id text primary key,
  chain text not null,
  district text,
  level_1 text,
  level_2 text,
  level_3 text,
  level_4 text,
  level_5 text,
  gameplay_role text,
  research_progression text
);

create table if not exists game_constants (
  id text primary key,
  constant text not null,
  value jsonb,
  description text
);

create table if not exists feature_flags (
  id text primary key,
  feature text not null,
  enabled boolean default false,
  launch_phase text,
  notes text
);

create table if not exists changelog (
  id text primary key,
  version text,
  sheet_or_table text,
  change_type text,
  change_summary text,
  created_at timestamptz default now()
);

create index if not exists research_branch_idx on research(branch_id);
create index if not exists research_status_idx on research(status);
create index if not exists research_asset_id_idx on research(asset_id);
create index if not exists buildings_era_idx on buildings(era);
create index if not exists conceptual_art_created_at_idx on conceptual_art(created_at desc);
create index if not exists conceptual_art_category_idx on conceptual_art(category);
create index if not exists galaxies_universe_id_idx on galaxies(universe_id);
create index if not exists sectors_galaxy_id_idx on sectors(galaxy_id);
create index if not exists sectors_discovered_idx on sectors(discovered);
create index if not exists star_systems_sector_id_idx on star_systems(sector_id);
create index if not exists star_systems_discovered_idx on star_systems(discovered);
create index if not exists stars_system_id_idx on stars(system_id);
create index if not exists universe_planets_system_id_idx on universe_planets(system_id);
create index if not exists universe_planets_discovered_idx on universe_planets(discovered);
create index if not exists universe_planets_class_idx on universe_planets(planet_class);
create index if not exists planets_category_idx on planets(category);
create index if not exists planets_status_idx on planets(status);
create index if not exists generated_planets_created_at_idx on generated_planets(created_at desc);
create index if not exists generated_planets_class_idx on generated_planets(planet_class);
create index if not exists planet_render_library_status_idx on planet_render_library(status);
create index if not exists planet_render_library_class_idx on planet_render_library(planet_class);
create index if not exists planet_render_library_biome_idx on planet_render_library(biome);
create index if not exists planet_render_library_rings_idx on planet_render_library(has_rings);
create index if not exists planet_render_library_usage_idx on planet_render_library(usage_count);
create index if not exists unlock_matrix_status_idx on unlock_matrix(implementation_status);
create index if not exists upgrades_type_idx on upgrades(type);
create index if not exists building_relationships_status_idx on building_relationships(implementation_status);
create index if not exists feature_flags_enabled_idx on feature_flags(enabled);

insert into storage.buckets (id, name, public)
values ('project-genesis-assets', 'project-genesis-assets', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Project Genesis public asset reads" on storage.objects;
create policy "Project Genesis public asset reads"
on storage.objects for select
using (bucket_id = 'project-genesis-assets');
