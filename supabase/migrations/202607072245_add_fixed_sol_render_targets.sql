alter table public.planet_render_library
  add column if not exists fixed_sol_body text default '';

update public.planet_render_library
  set fixed_sol_body = ''
  where fixed_sol_body is null;

alter table public.planet_render_library
  alter column fixed_sol_body set default '',
  alter column fixed_sol_body set not null;

create index if not exists planet_render_library_fixed_sol_body_idx
  on public.planet_render_library(fixed_sol_body);
