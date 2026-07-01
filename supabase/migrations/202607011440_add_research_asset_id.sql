alter table public.research
  add column if not exists asset_id text;

do $$
begin
  alter table public.research
    add constraint research_asset_id_fkey
    foreign key (asset_id)
    references public.assets(id)
    on delete set null;
exception
  when duplicate_object then null;
end $$;

create index if not exists research_asset_id_idx
  on public.research(asset_id);
