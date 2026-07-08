alter table star_systems
  add column if not exists system_type text not null default 'Procedural Star System',
  add column if not exists system_role text not null default 'Exploration Target',
  add column if not exists generation_type text not null default 'Procedural',
  add column if not exists primary_star text,
  add column if not exists star_type text,
  add column if not exists starting_system boolean not null default false,
  add column if not exists is_procedural boolean not null default true;

create table if not exists celestial_bodies (
  id text primary key,
  system_id text references star_systems(id) on delete cascade,
  parent_body_id text references celestial_bodies(id) on delete set null,
  name text not null,
  celestial_body_type text not null,
  planet_class text,
  planet_subclass text,
  planet_rarity text,
  biome text,
  atmosphere text,
  gravity text,
  orbit_position integer,
  orbit_parent text,
  landable boolean not null default false,
  colonizable boolean not null default false,
  colonizable_status text not null default 'Unknown',
  uses_orbital_gameplay boolean not null default false,
  is_fixed boolean not null default false,
  is_starting_body boolean not null default false,
  is_procedural boolean not null default true,
  unlock_requirement text,
  resources jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists star_systems_starting_system_idx on star_systems(starting_system);
create index if not exists celestial_bodies_system_id_idx on celestial_bodies(system_id);
create index if not exists celestial_bodies_parent_body_id_idx on celestial_bodies(parent_body_id);
create index if not exists celestial_bodies_type_idx on celestial_bodies(celestial_body_type);
create index if not exists celestial_bodies_fixed_idx on celestial_bodies(is_fixed);

insert into universes (id, universe_seed, name)
values ('universe-project-genesis-universe', 'PROJECT-GENESIS-UNIVERSE', 'Genesis Universe')
on conflict (id) do update set
  universe_seed = excluded.universe_seed,
  name = excluded.name;

insert into galaxies (id, universe_id, universe_seed, galaxy_seed, name, galaxy_type, galaxy_size, sector_count)
values (
  'galaxy-milky-way',
  'universe-project-genesis-universe',
  'PROJECT-GENESIS-UNIVERSE',
  'PROJECT-GENESIS-UNIVERSE:milky-way',
  'Milky Way',
  'Spiral Galaxy',
  'Starting Galaxy',
  100000
)
on conflict (id) do update set
  universe_id = excluded.universe_id,
  universe_seed = excluded.universe_seed,
  galaxy_seed = excluded.galaxy_seed,
  name = excluded.name,
  galaxy_type = excluded.galaxy_type,
  galaxy_size = excluded.galaxy_size,
  sector_count = excluded.sector_count;

insert into sectors (
  id, galaxy_id, sector_seed, sector_name, coordinates_x, coordinates_y, coordinates_z,
  sector_type, sector_rarity, system_count, difficulty, discovery_value, discovery_level,
  modifier, resource_signal, colonized_worlds, discovered, discovered_at
)
values (
  'sector-local-bubble',
  'galaxy-milky-way',
  'PROJECT-GENESIS-UNIVERSE:milky-way:local-bubble',
  'Local Bubble',
  0,
  0,
  0,
  'Civilized Space',
  'Common',
  24,
  5,
  100,
  'Scanned',
  'Starting Region',
  'Balanced',
  1,
  true,
  now()
)
on conflict (id) do update set
  galaxy_id = excluded.galaxy_id,
  sector_seed = excluded.sector_seed,
  sector_name = excluded.sector_name,
  coordinates_x = excluded.coordinates_x,
  coordinates_y = excluded.coordinates_y,
  coordinates_z = excluded.coordinates_z,
  sector_type = excluded.sector_type,
  sector_rarity = excluded.sector_rarity,
  system_count = excluded.system_count,
  difficulty = excluded.difficulty,
  discovery_value = excluded.discovery_value,
  discovery_level = excluded.discovery_level,
  modifier = excluded.modifier,
  resource_signal = excluded.resource_signal,
  colonized_worlds = excluded.colonized_worlds,
  discovered = excluded.discovered;

insert into star_systems (
  id, sector_id, system_seed, system_name, catalog_designation, system_type, system_role,
  generation_type, system_rarity, star_count, planet_count, primary_star, star_type,
  resource_bias, danger_level, starting_system, is_procedural, discovered, discovered_at
)
values (
  'system-sol',
  'sector-local-bubble',
  'PROJECT-GENESIS-UNIVERSE:milky-way:local-bubble:sol',
  'Sol',
  'SOL-0001',
  'Single Star System',
  'Starting System',
  'Handcrafted',
  'Common',
  1,
  15,
  'Sol',
  'Yellow Main Sequence',
  'Balanced',
  8,
  true,
  false,
  true,
  now()
)
on conflict (id) do update set
  sector_id = excluded.sector_id,
  system_seed = excluded.system_seed,
  system_name = excluded.system_name,
  catalog_designation = excluded.catalog_designation,
  system_type = excluded.system_type,
  system_role = excluded.system_role,
  generation_type = excluded.generation_type,
  system_rarity = excluded.system_rarity,
  star_count = excluded.star_count,
  planet_count = excluded.planet_count,
  primary_star = excluded.primary_star,
  star_type = excluded.star_type,
  resource_bias = excluded.resource_bias,
  danger_level = excluded.danger_level,
  starting_system = excluded.starting_system,
  is_procedural = excluded.is_procedural,
  discovered = excluded.discovered;

insert into stars (id, system_id, star_seed, star_name, star_type, star_size, star_temperature, star_color, luminosity, age)
values (
  'star-sol',
  'system-sol',
  'PROJECT-GENESIS-UNIVERSE:milky-way:local-bubble:sol:star:sol',
  'Sol',
  'Yellow Main Sequence',
  'Standard',
  5772,
  'Yellow',
  100,
  '4.6b years'
)
on conflict (id) do update set
  system_id = excluded.system_id,
  star_seed = excluded.star_seed,
  star_name = excluded.star_name,
  star_type = excluded.star_type,
  star_size = excluded.star_size,
  star_temperature = excluded.star_temperature,
  star_color = excluded.star_color,
  luminosity = excluded.luminosity,
  age = excluded.age;

insert into celestial_bodies (
  id, system_id, parent_body_id, name, celestial_body_type, planet_class, planet_subclass,
  planet_rarity, biome, atmosphere, gravity, orbit_position, orbit_parent, landable,
  colonizable, colonizable_status, uses_orbital_gameplay, is_fixed, is_starting_body,
  is_procedural, unlock_requirement, resources, notes
)
values
  ('body-sol', 'system-sol', null, 'Sol', 'Star', null, null, null, null, null, null, null, null, false, false, 'Not Colonizable', false, true, false, false, 'Start', '["Solar Energy"]'::jsonb, 'The home star of humanity.'),
  ('body-earth', 'system-sol', 'body-sol', 'Earth', 'Planet', 'Terrestrial', 'Earthlike', 'Common', 'Mixed', 'Breathable', 'Standard', 3, 'Sol', true, true, 'Already Colonized', false, true, true, false, 'Start', '["All Earth Resources"]'::jsonb, 'Humanity''s home world and the starting point of Project Genesis.'),
  ('body-moon', 'system-sol', 'body-earth', 'Moon', 'Moon', 'Dead', 'Airless', 'Common', 'Regolith', 'None', 'Low', null, 'Earth', true, true, 'Colonizable', false, true, false, false, 'Lunar Exploration', '["Helium-3","Regolith","Titanium","Rare Earth Elements"]'::jsonb, 'First off-world colony target.'),
  ('body-mercury', 'system-sol', 'body-sol', 'Mercury', 'Planet', 'Dead', 'Barren', 'Common', 'Rocky', 'Trace', 'Low', 1, 'Sol', true, true, 'Late Game', false, true, false, false, 'Planetary Exploration', '["Iron","Nickel","Silicon","Rare Earth Elements"]'::jsonb, 'Harsh inner-world mining planet close to Sol.'),
  ('body-venus', 'system-sol', 'body-sol', 'Venus', 'Planet', 'Toxic', 'Green Atmosphere', 'Rare', 'Volcanic Highlands', 'Dense CO2', 'High', 2, 'Sol', false, true, 'Terraforming Required', false, true, false, false, 'Planetary Exploration', '["Sulfur","Chemical Salts","Rare Metals","Titanium"]'::jsonb, 'Extreme heat and pressure. Major late-game terraforming candidate.'),
  ('body-mars', 'system-sol', 'body-sol', 'Mars', 'Planet', 'Desert', 'Rock Desert', 'Common', 'Dust Basin', 'Thin CO2', 'Low', 4, 'Sol', true, true, 'Colonizable', false, true, false, false, 'Planetary Exploration', '["Iron","Silicon","Water Ice","Titanium"]'::jsonb, 'First major planetary colony target.'),
  ('body-asteroid-belt', 'system-sol', 'body-sol', 'Asteroid Belt', 'Asteroid Belt', null, 'Asteroid Megabelt', 'Common', null, 'None', 'Microgravity', null, 'Sol', false, false, 'Not Colonizable', true, true, false, false, 'Asteroid Mining', '["Iron","Nickel","Gold","Platinum","Iridium","Rare Earth Elements"]'::jsonb, 'Resource field between Mars and Jupiter.'),
  ('body-jupiter', 'system-sol', 'body-sol', 'Jupiter', 'Planet', 'Gas Giant', 'Storm Giant', 'Rare', 'Upper Atmosphere', 'Hydrogen / Helium', 'Extreme', 5, 'Sol', false, false, 'Not Colonizable', true, true, false, false, 'Gas Giant Harvesting', '["Hydrogen","Helium","Helium-3","Storm Plasma","Metallic Hydrogen"]'::jsonb, 'First major orbital harvesting world.'),
  ('body-europa', 'system-sol', 'body-jupiter', 'Europa', 'Moon', 'Ice', 'Frozen Ocean', 'Rare', 'Ice Shell', 'Trace', 'Low', null, 'Jupiter', true, true, 'Future', false, true, false, false, 'Outer Moon Exploration', '["Water Ice","Heavy Water","Ammonia"]'::jsonb, 'Possible subsurface ocean world.'),
  ('body-ganymede', 'system-sol', 'body-jupiter', 'Ganymede', 'Moon', 'Ice', 'Glacial', 'Uncommon', 'Ice Plains', 'Trace', 'Low', null, 'Jupiter', true, true, 'Future', false, true, false, false, 'Outer Moon Exploration', '["Water Ice","Iron","Silicon"]'::jsonb, 'Large icy moon with colony potential.'),
  ('body-saturn', 'system-sol', 'body-sol', 'Saturn', 'Planet', 'Gas Giant', 'Banded', 'Rare', 'Upper Atmosphere', 'Hydrogen / Helium', 'Extreme', 6, 'Sol', false, false, 'Not Colonizable', true, true, false, false, 'Gas Giant Harvesting', '["Hydrogen","Helium","Helium-3","Methane"]'::jsonb, 'Orbital harvesting world with iconic rings.'),
  ('body-titan', 'system-sol', 'body-saturn', 'Titan', 'Moon', 'Toxic', 'Chemical Seas', 'Rare', 'Hydrocarbon Lakes', 'Dense Nitrogen', 'Low', null, 'Saturn', true, true, 'Future', false, true, false, false, 'Outer Moon Exploration', '["Methane","Hydrocarbons","Nitrogen Ice"]'::jsonb, 'Fuel economy and atmospheric chemistry world.'),
  ('body-enceladus', 'system-sol', 'body-saturn', 'Enceladus', 'Moon', 'Ice', 'Cryovolcanic', 'Rare', 'Ice Geysers', 'Trace', 'Very Low', null, 'Saturn', true, true, 'Future', false, true, false, false, 'Outer Moon Exploration', '["Water Ice","Heavy Water","Organic Compounds"]'::jsonb, 'Cryovolcanic research world.'),
  ('body-uranus', 'system-sol', 'body-sol', 'Uranus', 'Planet', 'Gas Giant', 'Ice Giant', 'Uncommon', 'Upper Atmosphere', 'Hydrogen / Methane / Helium', 'Extreme', 7, 'Sol', false, false, 'Not Colonizable', true, true, false, false, 'Deep Space Communications', '["Hydrogen","Methane","Ammonia","Helium"]'::jsonb, 'Outer system ice giant.'),
  ('body-neptune', 'system-sol', 'body-sol', 'Neptune', 'Planet', 'Gas Giant', 'Cyclone Giant', 'Rare', 'Upper Atmosphere', 'Hydrogen / Helium / Methane', 'Extreme', 8, 'Sol', false, false, 'Not Colonizable', true, true, false, false, 'Deep Space Communications', '["Hydrogen","Helium","Storm Plasma","Methane"]'::jsonb, 'High-wind outer system gas giant.'),
  ('body-pluto', 'system-sol', 'body-sol', 'Pluto', 'Dwarf Planet', 'Ice', 'Polar', 'Uncommon', 'Frozen Plains', 'Thin Nitrogen', 'Very Low', null, 'Sol', true, true, 'Future', false, true, false, false, 'Deep Space Communications', '["Nitrogen Ice","Methane Ice","Water Ice"]'::jsonb, 'Edge of the starting Sol system.')
on conflict (id) do update set
  system_id = excluded.system_id,
  parent_body_id = excluded.parent_body_id,
  name = excluded.name,
  celestial_body_type = excluded.celestial_body_type,
  planet_class = excluded.planet_class,
  planet_subclass = excluded.planet_subclass,
  planet_rarity = excluded.planet_rarity,
  biome = excluded.biome,
  atmosphere = excluded.atmosphere,
  gravity = excluded.gravity,
  orbit_position = excluded.orbit_position,
  orbit_parent = excluded.orbit_parent,
  landable = excluded.landable,
  colonizable = excluded.colonizable,
  colonizable_status = excluded.colonizable_status,
  uses_orbital_gameplay = excluded.uses_orbital_gameplay,
  is_fixed = excluded.is_fixed,
  is_starting_body = excluded.is_starting_body,
  is_procedural = excluded.is_procedural,
  unlock_requirement = excluded.unlock_requirement,
  resources = excluded.resources,
  notes = excluded.notes,
  updated_at = now();
