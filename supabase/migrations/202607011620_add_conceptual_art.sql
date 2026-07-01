create table if not exists public.conceptual_art (
  id text primary key,
  name text not null,
  category text,
  description text,
  file_url text not null,
  file_name text,
  file_type text,
  file_size bigint default 0,
  storage_path text,
  status text default 'Uploaded',
  notes text,
  created_at timestamptz default now()
);

create index if not exists conceptual_art_created_at_idx
  on public.conceptual_art(created_at desc);

create index if not exists conceptual_art_category_idx
  on public.conceptual_art(category);
