create table if not exists public.planets (
  id text primary key,
  category text not null,
  value text not null,
  description text,
  generation_rule text,
  frequency text,
  weight numeric default 0,
  min_value numeric default 0,
  max_value numeric default 0,
  biome_tags jsonb default '[]'::jsonb,
  resource_tags jsonb default '[]'::jsonb,
  status text default 'Draft',
  notes text
);

create index if not exists planets_category_idx
  on public.planets(category);

create index if not exists planets_status_idx
  on public.planets(status);
