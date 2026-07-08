alter table public.celestial_bodies
  add column if not exists orbit_view_prompt text,
  add column if not exists orbit_view_image_url text,
  add column if not exists surface_landscape_prompt text,
  add column if not exists surface_landscape_image_url text,
  add column if not exists surface_landscape_status text default 'Not Started',
  add column if not exists surface_landscape_notes text,
  add column if not exists hero_discovery_prompt text,
  add column if not exists hero_discovery_image_url text,
  add column if not exists hero_discovery_status text default 'Future';

update public.celestial_bodies
set
  surface_landscape_status = coalesce(surface_landscape_status, 'Not Started'),
  hero_discovery_status = coalesce(hero_discovery_status, 'Future')
where surface_landscape_status is null
   or hero_discovery_status is null;
