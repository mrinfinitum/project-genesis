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

create index if not exists galaxies_universe_id_idx on galaxies(universe_id);
create index if not exists sectors_galaxy_id_idx on sectors(galaxy_id);
create index if not exists sectors_discovered_idx on sectors(discovered);
create index if not exists star_systems_sector_id_idx on star_systems(sector_id);
create index if not exists star_systems_discovered_idx on star_systems(discovered);
create index if not exists stars_system_id_idx on stars(system_id);
create index if not exists universe_planets_system_id_idx on universe_planets(system_id);
create index if not exists universe_planets_discovered_idx on universe_planets(discovered);
create index if not exists universe_planets_class_idx on universe_planets(planet_class);
