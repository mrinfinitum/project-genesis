alter table public.generated_planets
  add column if not exists deep_planet_data jsonb not null default '{}'::jsonb;

comment on column public.generated_planets.deep_planet_data is
  'Versioned planet-deep-data aggregate. References canonical Planet Types, Resources, and reusable environment profiles without duplicating definitions.';

create index if not exists generated_planets_deep_planet_data_gin
  on public.generated_planets using gin (deep_planet_data);
