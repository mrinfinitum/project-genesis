alter table public.generated_planets
  add column if not exists rarity text default 'Common';

update public.generated_planets
set rarity = 'Common'
where rarity is null or trim(rarity) = '';
