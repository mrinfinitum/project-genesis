alter table public.generated_planets
  add column if not exists image_url text;

alter table public.generated_planets
  add column if not exists image_prompt text;

alter table public.generated_planets
  add column if not exists image_status text default 'Not Rendered';

alter table public.generated_planets
  add column if not exists image_variants jsonb default '[]'::jsonb;
