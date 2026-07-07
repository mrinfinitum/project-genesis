create table if not exists codex_tasks (
  id text primary key,
  title text not null,
  source_type text,
  source_id text,
  system text,
  priority text default 'Medium',
  status text default 'Open',
  description text,
  related_tables jsonb default '[]'::jsonb,
  export_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  notes text
);

create index if not exists codex_tasks_status_idx on codex_tasks(status);
create index if not exists codex_tasks_system_idx on codex_tasks(system);
