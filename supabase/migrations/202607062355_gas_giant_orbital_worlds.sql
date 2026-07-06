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

update generated_planets
set
  colonizable = false,
  landable = false,
  surface_exploration = false,
  terrain_generation = false,
  uses_orbital_gameplay = true
where lower(planet_class) = 'gas giant';

create table if not exists planet_classes (
  planet_class text primary key,
  landable boolean not null default true,
  colonizable boolean not null default true,
  uses_surface_generation boolean not null default true,
  uses_orbital_gameplay boolean not null default false,
  default_interaction_type text not null default 'Surface Exploration',
  notes text default ''
);

insert into planet_classes (planet_class, landable, colonizable, uses_surface_generation, uses_orbital_gameplay, default_interaction_type, notes)
values
  ('Gas Giant', false, false, false, true, 'Orbital Harvesting', 'Non-landable orbital resource world using stations, platforms, harvesters, and refineries.')
on conflict (planet_class) do update set
  landable = excluded.landable,
  colonizable = excluded.colonizable,
  uses_surface_generation = excluded.uses_surface_generation,
  uses_orbital_gameplay = excluded.uses_orbital_gameplay,
  default_interaction_type = excluded.default_interaction_type,
  notes = excluded.notes;

create index if not exists generated_planets_orbital_gameplay_idx
  on generated_planets(uses_orbital_gameplay);
