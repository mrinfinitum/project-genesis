alter table galaxies
  add column if not exists universe_seed text,
  add column if not exists galaxy_size text not null default 'Infinite';

alter table sectors
  add column if not exists sector_name text not null default 'Uncharted Sector',
  add column if not exists sector_type text not null default 'Uncharted Space',
  add column if not exists sector_rarity text not null default 'Common',
  add column if not exists difficulty integer not null default 0,
  add column if not exists discovery_value integer not null default 0,
  add column if not exists discovery_level text not null default 'Unknown',
  add column if not exists modifier text not null default 'Stable Corridor',
  add column if not exists resource_signal text not null default 'Balanced',
  add column if not exists colonized_worlds integer not null default 0;

create index if not exists galaxies_seed_size_idx on galaxies(galaxy_seed, galaxy_size);
create index if not exists sectors_type_idx on sectors(sector_type);
create index if not exists sectors_rarity_idx on sectors(sector_rarity);
create index if not exists sectors_discovery_level_idx on sectors(discovery_level);
