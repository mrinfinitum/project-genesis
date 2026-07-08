alter table star_systems
  add column if not exists discovery_state text not null default 'Undetected',
  add column if not exists detected_at timestamptz,
  add column if not exists probed_at timestamptz,
  add column if not exists scanned_at timestamptz,
  add column if not exists visited_at timestamptz,
  add column if not exists surveyed_at timestamptz,
  add column if not exists colonized_at timestamptz,
  add column if not exists estimated_planet_count_min integer,
  add column if not exists estimated_planet_count_max integer,
  add column if not exists estimated_celestial_body_count_min integer,
  add column if not exists estimated_celestial_body_count_max integer,
  add column if not exists estimated_danger_level integer,
  add column if not exists known_star_signature text,
  add column if not exists probe_data jsonb not null default '{}'::jsonb,
  add column if not exists scan_data jsonb not null default '{}'::jsonb;

create table if not exists system_probes (
  id text primary key,
  system_id text references star_systems(id) on delete cascade,
  probe_type text not null,
  launched_at timestamptz,
  arrival_at timestamptz,
  status text not null default 'Planned',
  scan_quality integer not null default 0,
  revealed_data jsonb not null default '{}'::jsonb,
  notes text
);

create index if not exists star_systems_discovery_state_idx on star_systems(discovery_state);
create index if not exists system_probes_system_id_idx on system_probes(system_id);
create index if not exists system_probes_status_idx on system_probes(status);

update star_systems
set
  discovery_state = 'Colonized',
  detected_at = coalesce(detected_at, now()),
  probed_at = coalesce(probed_at, now()),
  scanned_at = coalesce(scanned_at, now()),
  visited_at = coalesce(visited_at, now()),
  surveyed_at = coalesce(surveyed_at, now()),
  colonized_at = coalesce(colonized_at, now()),
  estimated_planet_count_min = 15,
  estimated_planet_count_max = 15,
  estimated_celestial_body_count_min = 16,
  estimated_celestial_body_count_max = 16,
  estimated_danger_level = danger_level,
  known_star_signature = 'Yellow Main Sequence',
  probe_data = jsonb_build_object('interaction', 'Starting system', 'status', 'Fully known'),
  scan_data = jsonb_build_object('celestial_bodies', 16, 'handcrafted', true)
where id = 'system-sol';
