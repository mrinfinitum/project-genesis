alter table generated_planets add column if not exists orbit_view_prompt text;
alter table generated_planets add column if not exists orbit_view_image_url text;
alter table generated_planets add column if not exists surface_landscape_prompt text;
alter table generated_planets add column if not exists surface_landscape_image_url text;
alter table generated_planets add column if not exists surface_landscape_status text default 'Not Started';
alter table generated_planets add column if not exists surface_landscape_notes text;

update generated_planets
set
  orbit_view_prompt = coalesce(orbit_view_prompt, image_prompt),
  orbit_view_image_url = coalesce(orbit_view_image_url, image_url)
where orbit_view_prompt is null
   or orbit_view_image_url is null;

create table if not exists planet_prompt_library (
  id text primary key,
  planet_id text references generated_planets(id) on delete cascade,
  planet_class text not null default '',
  planet_subclass text not null default '',
  prompt_type text not null default 'Orbit View',
  aspect_ratio text not null default '1:1',
  reference_image_key text default '',
  reference_image_url text default '',
  prompt_text text not null default '',
  image_url text default '',
  status text default 'Draft',
  recommended_use text default '',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists planet_prompt_library_planet_idx
  on planet_prompt_library(planet_id);

create index if not exists planet_prompt_library_prompt_type_idx
  on planet_prompt_library(prompt_type);

create index if not exists planet_prompt_library_class_idx
  on planet_prompt_library(planet_class, planet_subclass);
