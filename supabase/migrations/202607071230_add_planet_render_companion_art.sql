alter table public.planet_render_library
  add column if not exists landscape_image_url text default '',
  add column if not exists landscape_storage_path text default '',
  add column if not exists landscape_source_path text default '',
  add column if not exists orbital_image_url text default '',
  add column if not exists orbital_storage_path text default '',
  add column if not exists orbital_source_path text default '';

