delete from public.planet_resource_profiles
where lower(planet_class) = 'terrestrial'
  and lower(subclass) = 'supercontinent';

insert into public.planet_resource_profiles (
  id,
  planet_class,
  subclass,
  discovery_tier,
  colonizable,
  mining_difficulty,
  resource_density,
  planet_rarity_bias,
  guaranteed_resources,
  common_resources,
  rare_resources,
  exotic_resources,
  scientific_notes
)
values (
  'planet-resource-terrestrial-swamp',
  'Terrestrial',
  'Swamp',
  'Earth',
  'Yes',
  2,
  'Balanced',
  'Common-Uncommon',
  '["Fresh Water", "Soil", "Living Biomass"]'::jsonb,
  '["Stone", "Coal", "Copper", "Limestone"]'::jsonb,
  '["Gold", "Rare Earth Elements", "Ancient Fossils"]'::jsonb,
  '["Exotic Matter", "Alien Organics"]'::jsonb,
  'Wetland worlds support biological resources, sediment deposits, and difficult but valuable lowland extraction.'
)
on conflict (id) do update set
  planet_class = excluded.planet_class,
  subclass = excluded.subclass,
  discovery_tier = excluded.discovery_tier,
  colonizable = excluded.colonizable,
  mining_difficulty = excluded.mining_difficulty,
  resource_density = excluded.resource_density,
  planet_rarity_bias = excluded.planet_rarity_bias,
  guaranteed_resources = excluded.guaranteed_resources,
  common_resources = excluded.common_resources,
  rare_resources = excluded.rare_resources,
  exotic_resources = excluded.exotic_resources,
  scientific_notes = excluded.scientific_notes,
  updated_at = now();

alter table public.generated_planets
  add column if not exists planet_subclass text;

update public.generated_planets
set planet_subclass = 'Swamp'
where lower(planet_class) = 'terrestrial'
  and lower(coalesce(planet_subclass, '')) = 'supercontinent';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'generated_planets'
      and column_name = 'primary_biome'
  ) then
    update public.generated_planets
    set primary_biome = 'Swamp'
    where lower(planet_class) = 'terrestrial'
      and lower(primary_biome) = 'supercontinent';
  end if;
end $$;

update public.planet_render_library
set biome = 'Swamp',
    updated_at = now()
where lower(planet_class) = 'terrestrial'
  and lower(biome) = 'supercontinent';
