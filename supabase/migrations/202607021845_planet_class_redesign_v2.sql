alter table public.generated_planets
  add column if not exists planet_subclass text;

alter table public.generated_planets
  add column if not exists anomalies jsonb default '[]'::jsonb;

update public.generated_planets
set anomalies = '[]'::jsonb
where anomalies is null;
