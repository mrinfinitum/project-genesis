create table if not exists project_systems (
  id text primary key,
  name text not null,
  group_name text not null,
  description text,
  icon text,
  status text default 'In Progress',
  completion_percent integer default 0,
  total_records integer default 0,
  complete_records integer default 0,
  draft_records integer default 0,
  needs_review_records integer default 0,
  missing_required_fields integer default 0,
  blocked_records integer default 0,
  codex_ready_count integer default 0,
  last_updated timestamptz default now(),
  next_action text,
  priority text default 'Medium',
  notes text
);

create table if not exists project_system_history (
  id text primary key,
  system_id text references project_systems(id) on delete cascade,
  date timestamptz default now(),
  completion_percent integer default 0,
  total_records integer default 0,
  complete_records integer default 0,
  needs_review_records integer default 0,
  missing_required_fields integer default 0,
  notes text
);

create table if not exists data_health_checks (
  id text primary key,
  system text not null,
  issue text not null,
  severity text default 'Medium',
  affected_count integer default 0,
  description text,
  recommended_action text,
  resolved boolean default false,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create table if not exists codex_readiness_items (
  id text primary key,
  title text not null,
  system text not null,
  status text default 'In Progress',
  description text,
  related_tables jsonb default '[]'::jsonb,
  export_path text,
  priority text default 'Medium',
  created_at timestamptz default now(),
  notes text
);

create table if not exists dashboard_metrics (
  id text primary key,
  metric_name text not null,
  metric_value text,
  metric_group text default 'hero',
  display_order integer default 0,
  updated_at timestamptz default now()
);

create index if not exists project_systems_group_idx on project_systems(group_name);
create index if not exists project_systems_status_idx on project_systems(status);
create index if not exists project_system_history_system_idx on project_system_history(system_id);
create index if not exists data_health_checks_resolved_idx on data_health_checks(resolved);
create index if not exists codex_readiness_items_status_idx on codex_readiness_items(status);
create index if not exists dashboard_metrics_group_idx on dashboard_metrics(metric_group);

with seed(id, name, group_name, description, icon, completion_percent, total_records, complete_records, next_action, priority) as (
  values
    ('universe', 'Universe', 'Core Foundation', 'Deterministic universe architecture, root seeds, and world rules.', 'Orbit', 5, 8, 0, 'Draft universe seed schema and galaxy root identifiers.', 'Critical'),
    ('galaxy', 'Galaxy', 'Core Foundation', 'Galaxy map, sectors, regions, and traversal layer.', 'Compass', 10, 16, 2, 'Build sector tables and connect explorer output.', 'Critical'),
    ('star-systems', 'Star Systems', 'Core Foundation', 'Generated star systems, orbital slots, and stellar metadata.', 'Sun', 15, 24, 4, 'Create persistent star system generation tables.', 'High'),
    ('seeds', 'Seeds', 'Core Foundation', 'Root seed rules for repeatable generation.', 'Fingerprint', 20, 20, 4, 'Lock seed format for planets, systems, and sectors.', 'High'),
    ('exports', 'Exports', 'Core Foundation', 'Codex and Roblox-ready JSON export surface.', 'Download', 70, 18, 12, 'Add universe and resource profile exports.', 'Medium'),
    ('planet-classes', 'Planet Classes', 'Planet Generation', 'Main planet classes and landability rules.', 'CircleDot', 78, 20, 16, 'Audit gas giant orbital-only behavior.', 'High'),
    ('planet-subclasses', 'Planet Subclasses', 'Planet Generation', 'Second-level planet subclasses and art matching.', 'Layers', 62, 78, 48, 'Finish subclass-to-render-library mapping.', 'High'),
    ('planet-rarity', 'Planet Rarity', 'Planet Generation', 'Rarity rolls, discovery point bands, and card treatment.', 'Gem', 85, 10, 9, 'Expose rarity weights in generation docs.', 'Medium'),
    ('planet-resources', 'Planet Resources', 'Planet Generation', 'Planet resource profiles and resource catalog links.', 'Database', 65, 142, 92, 'Resolve unknown resource names in profiles.', 'Critical'),
    ('planet-prompt-library', 'Planet Prompt Library', 'Planet Generation', 'Copy-ready image prompts for external render workflows.', 'Palette', 55, 98, 54, 'Trim duplicate wording in subclass prompt blocks.', 'Medium'),
    ('planet-art-assets', 'Planet Art Assets', 'Planet Generation', 'PSD and PNG planet render library.', 'Image', 32, 28, 9, 'Import the next batch of biome render files.', 'High'),
    ('resources', 'Resources', 'Gameplay Database', 'Canonical resource catalog, usage, rarity, and planet availability.', 'Pickaxe', 90, 155, 140, 'Attach resource IDs to planet profile outputs.', 'High'),
    ('research', 'Research', 'Gameplay Database', 'Research nodes, branches, eras, and unlock logic.', 'FlaskConical', 100, 150, 150, 'Lock v1 research module export.', 'Medium'),
    ('buildings', 'Buildings', 'Gameplay Database', 'Buildings, costs, unlocks, production, and art references.', 'Building2', 75, 158, 118, 'Fill missing unlock research references.', 'High'),
    ('upgrades', 'Upgrades', 'Gameplay Database', 'Progression upgrades, tiers, and assets.', 'TrendingUp', 70, 137, 96, 'Attach final source PSD files.', 'Medium'),
    ('unlock-matrix', 'Unlock Matrix', 'Gameplay Database', 'Research-to-content unlock relationships.', 'GitBranch', 68, 265, 180, 'Map orphan unlock names to IDs.', 'High'),
    ('districts', 'Districts', 'Gameplay Database', 'District definitions, bonuses, and priority.', 'Map', 72, 14, 10, 'Connect district IDs to building records.', 'Medium'),
    ('wonders', 'Wonders', 'Gameplay Database', 'Civilization wonders and special bonuses.', 'Landmark', 58, 10, 6, 'Complete wonder requirements and art refs.', 'Medium'),
    ('ancient-civilizations', 'Ancient Civilizations', 'Galaxy Content', 'Ancient civilization pools for planet history.', 'Scroll', 35, 16, 6, 'Create first civilization relic set.', 'Medium'),
    ('planet-traits', 'Planet Traits', 'Galaxy Content', 'Trait pools, modifiers, and surface hooks.', 'Sparkles', 45, 24, 10, 'Normalize trait effect naming.', 'Medium'),
    ('anomalies', 'Anomalies', 'Galaxy Content', 'Rare planet and system anomalies.', 'Atom', 28, 20, 6, 'Define anomaly rarity and output effects.', 'Low'),
    ('hazards', 'Hazards', 'Galaxy Content', 'Environmental and orbital hazard catalog.', 'TriangleAlert', 52, 30, 15, 'Split surface hazards from orbital hazards.', 'Medium'),
    ('expeditions', 'Expeditions', 'Galaxy Content', 'Exploration outcomes and expedition events.', 'Rocket', 18, 18, 3, 'Draft expedition reward tables.', 'Low'),
    ('collectibles', 'Collectibles', 'Galaxy Content', 'Collectible pools, museums, and discovery rewards.', 'Archive', 20, 20, 4, 'Create resource-linked collectible sets.', 'Medium'),
    ('assets', 'Assets', 'Production', 'Game art assets, PSD sources, exports, and Roblox IDs.', 'Package', 15, 240, 36, 'Upload source PSDs for priority gameplay icons.', 'High'),
    ('tasks', 'Tasks', 'Production', 'Production task planning and implementation handoffs.', 'ListChecks', 40, 25, 10, 'Convert dashboard next steps into task records.', 'Medium'),
    ('release-notes', 'Release Notes', 'Production', 'Versioned release notes and milestone notes.', 'FileText', 50, 8, 4, 'Add Sprint 0 universe foundation notes.', 'Low'),
    ('changelog', 'Changelog', 'Production', 'Tracked content and schema changes.', 'History', 60, 30, 18, 'Summarize planet generation rewrite changes.', 'Low'),
    ('codex-handoffs', 'Codex Handoffs', 'Production', 'Codex-ready export packages and implementation briefs.', 'Bot', 42, 12, 5, 'Package resource catalog v2 for Roblox modules.', 'High')
)
insert into project_systems (
  id,
  name,
  group_name,
  description,
  icon,
  status,
  completion_percent,
  total_records,
  complete_records,
  draft_records,
  needs_review_records,
  missing_required_fields,
  blocked_records,
  codex_ready_count,
  last_updated,
  next_action,
  priority,
  notes
)
select
  id,
  name,
  group_name,
  description,
  icon,
  case when completion_percent >= 90 then 'Complete' when priority in ('Critical', 'High') then 'Needs Review' else 'In Progress' end,
  completion_percent,
  total_records,
  complete_records,
  greatest(0, total_records - complete_records - round((total_records - complete_records) * 0.35)::integer),
  round((total_records - complete_records) * 0.35)::integer,
  round((total_records - complete_records) * 0.22)::integer,
  case when priority = 'Critical' then 2 when priority = 'High' then 1 else 0 end,
  case when completion_percent >= 70 then greatest(1, round(complete_records / 25.0)::integer) else 0 end,
  '2026-07-06T00:00:00.000Z',
  next_action,
  priority,
  ''
from seed
on conflict (id) do update set
  name = excluded.name,
  group_name = excluded.group_name,
  description = excluded.description,
  icon = excluded.icon,
  status = excluded.status,
  completion_percent = excluded.completion_percent,
  total_records = excluded.total_records,
  complete_records = excluded.complete_records,
  draft_records = excluded.draft_records,
  needs_review_records = excluded.needs_review_records,
  missing_required_fields = excluded.missing_required_fields,
  blocked_records = excluded.blocked_records,
  codex_ready_count = excluded.codex_ready_count,
  last_updated = excluded.last_updated,
  next_action = excluded.next_action,
  priority = excluded.priority,
  notes = excluded.notes;

insert into project_system_history (
  id,
  system_id,
  date,
  completion_percent,
  total_records,
  complete_records,
  needs_review_records,
  missing_required_fields,
  notes
)
select
  project_systems.id || '-history-' || trend.point_index,
  project_systems.id,
  ('2026-07-06'::date - trend.days_ago)::timestamptz,
  greatest(0, project_systems.completion_percent - ((5 - trend.point_index) * 5)),
  project_systems.total_records,
  round(project_systems.total_records * greatest(0, project_systems.completion_percent - ((5 - trend.point_index) * 5)) / 100.0)::integer,
  project_systems.needs_review_records,
  project_systems.missing_required_fields,
  'Seeded trend sample.'
from project_systems
cross join (values (1, 28), (2, 21), (3, 14), (4, 7), (5, 0)) as trend(point_index, days_ago)
on conflict (id) do update set
  completion_percent = excluded.completion_percent,
  total_records = excluded.total_records,
  complete_records = excluded.complete_records,
  needs_review_records = excluded.needs_review_records,
  missing_required_fields = excluded.missing_required_fields,
  notes = excluded.notes;

insert into data_health_checks (id, system, issue, severity, affected_count, description, recommended_action, resolved, created_at, resolved_at)
values
  ('health-planet-resource-unknowns', 'Planet Resources', 'Planet resource profiles contain unknown resource names', 'Critical', 18, 'Several generated profile rows reference resource labels that need canonical resource IDs.', 'Normalize profile resources against the Resource Catalog v2 table.', false, '2026-07-06T00:00:00.000Z', null),
  ('health-building-unlocks', 'Buildings', 'Buildings missing unlock research', 'High', 14, 'Some building records are not connected to research unlock IDs.', 'Review building unlock fields and map them to research node IDs.', false, '2026-07-06T00:00:00.000Z', null),
  ('health-research-unlock-matrix', 'Research', 'Research nodes missing unlock matrix rows', 'Medium', 9, 'Research nodes marked ready should have matching unlock matrix records.', 'Generate matrix rows for ready research nodes without unlock coverage.', false, '2026-07-06T00:00:00.000Z', null),
  ('health-asset-files', 'Assets', 'Assets missing file URLs', 'High', 22, 'Priority art records still need source or generated file URLs.', 'Upload source PSDs and regenerate exported PNG variants.', false, '2026-07-06T00:00:00.000Z', null),
  ('health-planet-prompts', 'Planet Prompt Library', 'Planet art prompts missing subclass mapping', 'Medium', 11, 'Some prompt library entries do not line up with current class/subclass folders.', 'Sync prompt library rows with planet-renders folder names.', false, '2026-07-06T00:00:00.000Z', null)
on conflict (id) do update set
  system = excluded.system,
  issue = excluded.issue,
  severity = excluded.severity,
  affected_count = excluded.affected_count,
  description = excluded.description,
  recommended_action = excluded.recommended_action,
  resolved = excluded.resolved,
  resolved_at = excluded.resolved_at;

insert into codex_readiness_items (id, title, system, status, description, related_tables, export_path, priority, created_at, notes)
values
  ('codex-resource-catalog-v1', 'Resource Catalog v1.0', 'Resources', 'Ready', 'Canonical resource definitions are ready for Roblox module generation.', '["resource_catalog", "planet_resource_profiles"]'::jsonb, '/api/export/resource_catalog.json', 'High', '2026-07-06T00:00:00.000Z', 'Use for resource constants and economy references.'),
  ('codex-planet-resource-profiles-v2', 'Planet Resource Profiles v2.0', 'Planet Resources', 'Needs Review', 'Profile data is structurally ready but needs resource ID normalization.', '["planet_resource_profiles", "resource_catalog"]'::jsonb, '/api/export/planet_resource_profiles.json', 'Critical', '2026-07-06T00:00:00.000Z', 'Blocker for deterministic planet resource generation.'),
  ('codex-research-unlocks', 'Research Unlock Matrix', 'Research', 'In Progress', 'Research and unlock matrix can be exported for Lua unlock modules.', '["research", "unlock_matrix"]'::jsonb, '/api/export/research.json', 'High', '2026-07-06T00:00:00.000Z', 'Needs final orphan unlock review.')
on conflict (id) do update set
  title = excluded.title,
  system = excluded.system,
  status = excluded.status,
  description = excluded.description,
  related_tables = excluded.related_tables,
  export_path = excluded.export_path,
  priority = excluded.priority,
  notes = excluded.notes;

insert into dashboard_metrics (id, metric_name, metric_value, metric_group, display_order, updated_at)
values
  ('metric-current-sprint', 'Current Sprint', 'Sprint 0 Universe Foundation', 'hero', 1, '2026-07-06T00:00:00.000Z'),
  ('metric-database-version', 'Database Version', 'v0.4.0', 'hero', 2, '2026-07-06T00:00:00.000Z'),
  ('metric-ready-for-codex', 'Ready for Codex', '3', 'hero', 3, '2026-07-06T00:00:00.000Z')
on conflict (id) do update set
  metric_name = excluded.metric_name,
  metric_value = excluded.metric_value,
  metric_group = excluded.metric_group,
  display_order = excluded.display_order,
  updated_at = excluded.updated_at;
