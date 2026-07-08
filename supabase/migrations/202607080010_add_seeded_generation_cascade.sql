alter table if exists galaxies
  add column if not exists seed text,
  add column if not exists generation_parent_seed text,
  add column if not exists generation_index integer,
  add column if not exists generation_version text not null default 'seeded-cascade-v1',
  add column if not exists is_fixed boolean not null default false,
  add column if not exists is_procedural boolean not null default true;

alter table if exists sectors
  add column if not exists seed text,
  add column if not exists generation_parent_seed text,
  add column if not exists generation_index integer,
  add column if not exists generation_version text not null default 'seeded-cascade-v1',
  add column if not exists is_fixed boolean not null default false,
  add column if not exists is_procedural boolean not null default true;

alter table if exists star_systems
  add column if not exists seed text,
  add column if not exists generation_parent_seed text,
  add column if not exists generation_index integer,
  add column if not exists generation_version text not null default 'seeded-cascade-v1',
  add column if not exists is_fixed boolean not null default false;

alter table if exists stars
  add column if not exists seed text,
  add column if not exists generation_parent_seed text,
  add column if not exists generation_index integer,
  add column if not exists generation_version text not null default 'seeded-cascade-v1',
  add column if not exists is_fixed boolean not null default false,
  add column if not exists is_procedural boolean not null default true;

alter table if exists universe_planets
  add column if not exists seed text,
  add column if not exists generation_parent_seed text,
  add column if not exists generation_index integer,
  add column if not exists generation_version text not null default 'seeded-cascade-v1',
  add column if not exists is_fixed boolean not null default false,
  add column if not exists is_procedural boolean not null default true;

alter table if exists celestial_bodies
  add column if not exists seed text,
  add column if not exists generation_parent_seed text,
  add column if not exists generation_index integer,
  add column if not exists generation_version text not null default 'seeded-cascade-v1';

update galaxies
set
  seed = coalesce(seed, galaxy_seed),
  generation_parent_seed = coalesce(generation_parent_seed, universe_seed),
  generation_index = coalesce(generation_index, 0),
  is_fixed = case when id = 'galaxy-milky-way' then true else is_fixed end,
  is_procedural = case when id = 'galaxy-milky-way' then false else is_procedural end;

update sectors
set
  seed = coalesce(seed, sector_seed),
  generation_parent_seed = coalesce(generation_parent_seed, (
    select galaxies.galaxy_seed
    from galaxies
    where galaxies.id = sectors.galaxy_id
  )),
  generation_index = coalesce(generation_index, 0),
  is_fixed = case when id = 'sector-local-bubble' then true else is_fixed end,
  is_procedural = case when id = 'sector-local-bubble' then false else is_procedural end;

update star_systems
set
  seed = coalesce(seed, system_seed),
  generation_parent_seed = coalesce(generation_parent_seed, (
    select sectors.sector_seed
    from sectors
    where sectors.id = star_systems.sector_id
  )),
  generation_index = coalesce(generation_index, 0),
  is_fixed = case when id = 'system-sol' then true else is_fixed end;

update stars
set
  seed = coalesce(seed, star_seed),
  generation_parent_seed = coalesce(generation_parent_seed, (
    select star_systems.system_seed
    from star_systems
    where star_systems.id = stars.system_id
  )),
  generation_index = coalesce(generation_index, 0),
  is_fixed = case when system_id = 'system-sol' then true else is_fixed end,
  is_procedural = case when system_id = 'system-sol' then false else is_procedural end;

update celestial_bodies
set
  seed = coalesce(seed, id),
  generation_parent_seed = coalesce(generation_parent_seed, (
    select star_systems.system_seed
    from star_systems
    where star_systems.id = celestial_bodies.system_id
  )),
  generation_index = coalesce(generation_index, orbit_position, 0);

create index if not exists galaxies_generation_parent_seed_idx on galaxies(generation_parent_seed);
create index if not exists sectors_generation_parent_seed_idx on sectors(generation_parent_seed);
create index if not exists star_systems_generation_parent_seed_idx on star_systems(generation_parent_seed);
create index if not exists celestial_bodies_generation_parent_seed_idx on celestial_bodies(generation_parent_seed);
